use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer as SolTransfer};
use anchor_spl::token::{self, Token, TokenAccount, Transfer as TokenTransfer};

declare_id!("FD4wJxjtivZBoujfYACCUNo1D7ygsbn9Gx26cU1UqPXV");

// Property Registry program ID
const PROPERTY_REGISTRY_ID: &str = "5d3VC6f3bRHUZcos7GdA6fmj8Xtuhf2oSCDD988kmDWs";

#[derive(Clone)]
pub struct PropertyProgram;

impl anchor_lang::Id for PropertyProgram {
    fn id() -> Pubkey {
        Pubkey::from_str(PROPERTY_REGISTRY_ID).unwrap()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PropertyStatus {
    Available,   // 0 - Can be rented
    Rented,      // 1 - Currently rented with active lease
    Deactivated, // 2 - Deactivated by landlord
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateListingArgs {
    pub rent_amount: Option<u64>,
    pub deposit_amount: Option<u64>,
    pub lease_duration: Option<i64>,
    pub status: Option<PropertyStatus>,
    pub metadata_uri: Option<String>,
}

#[program]
pub mod rental_agreement {
    use super::*;

    pub fn create_lease(
        ctx: Context<CreateLease>,
        rent_amount: u64,
        deposit_amount: u64,
        lease_duration: i64,
    ) -> Result<()> {
        let agreement = &mut ctx.accounts.rental_agreement;
        let clock = Clock::get()?;

        require!(rent_amount > 0, RentalError::InvalidRentAmount);
        require!(deposit_amount > 0, RentalError::InvalidDepositAmount);
        require!(lease_duration > 0, RentalError::InvalidLeaseDuration);

        agreement.property = ctx.accounts.property.key();
        agreement.landlord = ctx.accounts.landlord.key();
        agreement.tenant = ctx.accounts.tenant.key();
        agreement.start_date = clock.unix_timestamp;
        agreement.end_date = clock.unix_timestamp + lease_duration;
        agreement.rent_amount = rent_amount;
        agreement.deposit_amount = deposit_amount;
        agreement.payment_count = 0;
        agreement.is_active = true;
        agreement.last_payment_date = 0;
        agreement.last_payment_amount = 0;
        agreement.total_paid = 0;
        agreement.payment_status = 0; // Current
        agreement.bump = ctx.bumps.rental_agreement;

        // Update property status to Rented through CPI
        let cpi_program = ctx.accounts.property_program.to_account_info();
        let cpi_accounts = vec![
            ctx.accounts.property.to_account_info(),
            ctx.accounts.landlord.to_account_info(),
        ];

        // Build instruction data manually for update_listing
        let mut ix_data = vec![
            // Instruction discriminator for update_listing (first 8 bytes)
            // This needs to match the discriminator in property-registry
            0x35, 0x28, 0xb5, 0xd8, 0x8e, 0x99, 0x4a, 0x3d,
        ];

        // Serialize the UpdateListingArgs
        let args = UpdateListingArgs {
            rent_amount: None,
            deposit_amount: None,
            lease_duration: None,
            status: Some(PropertyStatus::Rented),
            metadata_uri: None,
        };
        args.serialize(&mut ix_data)?;

        let update_ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: PropertyProgram::id(),
            accounts: vec![
                anchor_lang::solana_program::instruction::AccountMeta::new(
                    ctx.accounts.property.key(),
                    false,
                ),
                anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                    ctx.accounts.landlord.key(),
                    true,
                ),
            ],
            data: ix_data,
        };

        anchor_lang::solana_program::program::invoke(
            &update_ix,
            &cpi_accounts,
        )?;

        emit!(LeaseCreated {
            agreement: agreement.key(),
            property: agreement.property,
            landlord: agreement.landlord,
            tenant: agreement.tenant,
            rent_amount: agreement.rent_amount,
            deposit_amount: agreement.deposit_amount,
        });

        Ok(())
    }

    pub fn pay_rent(ctx: Context<PayRent>) -> Result<()> {
        let agreement = &mut ctx.accounts.rental_agreement;
        let clock = Clock::get()?;

        require!(agreement.is_active, RentalError::LeaseNotActive);
        require!(clock.unix_timestamp <= agreement.end_date, RentalError::LeaseExpired);

        // Check if payment is due (30 days = 2592000 seconds)
        if agreement.last_payment_date > 0 {
            let time_since_last_payment = clock.unix_timestamp - agreement.last_payment_date;
            require!(
                time_since_last_payment >= 2592000,
                RentalError::PaymentNotDue
            );
        }

        // Transfer USDC from tenant to landlord
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenTransfer {
                from: ctx.accounts.tenant_token_account.to_account_info(),
                to: ctx.accounts.landlord_token_account.to_account_info(),
                authority: ctx.accounts.tenant.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, agreement.rent_amount)?;

        agreement.payment_count += 1;
        agreement.last_payment_date = clock.unix_timestamp;
        agreement.last_payment_amount = agreement.rent_amount;
        agreement.total_paid += agreement.rent_amount;
        agreement.payment_status = 0; // Reset to current after payment

        emit!(RentPaid {
            agreement: agreement.key(),
            tenant: agreement.tenant,
            landlord: agreement.landlord,
            amount: agreement.rent_amount,
            payment_number: agreement.payment_count,
        });

        Ok(())
    }

    pub fn end_lease(ctx: Context<EndLease>) -> Result<()> {
        let agreement = &mut ctx.accounts.rental_agreement;

        require!(agreement.is_active, RentalError::LeaseNotActive);

        agreement.is_active = false;

        emit!(LeaseEnded {
            agreement: agreement.key(),
            property: agreement.property,
            landlord: agreement.landlord,
            tenant: agreement.tenant,
        });

        Ok(())
    }

    pub fn dispute_lease(ctx: Context<DisputeLease>, reason: String) -> Result<()> {
        let agreement = &ctx.accounts.rental_agreement;

        require!(agreement.is_active, RentalError::LeaseNotActive);
        require!(reason.len() <= 500, RentalError::ReasonTooLong);

        emit!(LeaseDisputed {
            agreement: agreement.key(),
            initiator: ctx.accounts.initiator.key(),
            reason,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLease<'info> {
    #[account(
        init,
        payer = tenant,
        space = 8 + RentalAgreement::INIT_SPACE,
        seeds = [b"rental", property.key().as_ref(), tenant.key().as_ref()],
        bump
    )]
    pub rental_agreement: Account<'info, RentalAgreement>,

    /// CHECK: Property account from property-registry program
    #[account(mut)]
    pub property: UncheckedAccount<'info>,

    /// CHECK: Landlord public key
    pub landlord: UncheckedAccount<'info>,

    #[account(mut)]
    pub tenant: Signer<'info>,

    /// CHECK: The Property Registry Program
    pub property_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayRent<'info> {
    #[account(
        mut,
        has_one = tenant,
        has_one = landlord,
        seeds = [b"rental", rental_agreement.property.as_ref(), tenant.key().as_ref()],
        bump = rental_agreement.bump
    )]
    pub rental_agreement: Account<'info, RentalAgreement>,

    /// CHECK: Landlord public key
    pub landlord: UncheckedAccount<'info>,

    #[account(mut)]
    pub tenant: Signer<'info>,

    #[account(mut)]
    pub tenant_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub landlord_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndLease<'info> {
    #[account(
        mut,
        has_one = landlord,
        seeds = [b"rental", rental_agreement.property.as_ref(), rental_agreement.tenant.as_ref()],
        bump = rental_agreement.bump
    )]
    pub rental_agreement: Account<'info, RentalAgreement>,

    pub landlord: Signer<'info>,
}

#[derive(Accounts)]
pub struct DisputeLease<'info> {
    #[account(
        seeds = [b"rental", rental_agreement.property.as_ref(), rental_agreement.tenant.as_ref()],
        bump = rental_agreement.bump
    )]
    pub rental_agreement: Account<'info, RentalAgreement>,

    pub initiator: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct RentalAgreement {
    pub property: Pubkey,           // 32
    pub landlord: Pubkey,           // 32
    pub tenant: Pubkey,             // 32
    pub start_date: i64,            // 8
    pub end_date: i64,              // 8
    pub rent_amount: u64,           // 8
    pub deposit_amount: u64,        // 8
    pub payment_count: u8,          // 1
    pub is_active: bool,            // 1
    pub last_payment_date: i64,     // 8
    pub last_payment_amount: u64,   // 8 - Track last payment
    pub total_paid: u64,            // 8 - Total amount paid
    pub payment_status: u8,         // 1 - 0=current, 1=late, 2=defaulted
    pub bump: u8,                   // 1
}

#[event]
pub struct LeaseCreated {
    pub agreement: Pubkey,
    pub property: Pubkey,
    pub landlord: Pubkey,
    pub tenant: Pubkey,
    pub rent_amount: u64,
    pub deposit_amount: u64,
}

#[event]
pub struct RentPaid {
    pub agreement: Pubkey,
    pub tenant: Pubkey,
    pub landlord: Pubkey,
    pub amount: u64,
    pub payment_number: u8,
}

#[event]
pub struct LeaseEnded {
    pub agreement: Pubkey,
    pub property: Pubkey,
    pub landlord: Pubkey,
    pub tenant: Pubkey,
}

#[event]
pub struct LeaseDisputed {
    pub agreement: Pubkey,
    pub initiator: Pubkey,
    pub reason: String,
}

#[error_code]
pub enum RentalError {
    #[msg("Rent amount must be greater than 0")]
    InvalidRentAmount,
    #[msg("Deposit amount must be greater than 0")]
    InvalidDepositAmount,
    #[msg("Lease duration must be greater than 0")]
    InvalidLeaseDuration,
    #[msg("Lease is not active")]
    LeaseNotActive,
    #[msg("Lease has expired")]
    LeaseExpired,
    #[msg("Payment is not due yet")]
    PaymentNotDue,
    #[msg("Dispute reason is too long (max 500 characters)")]
    ReasonTooLong,
}
