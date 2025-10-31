use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer as SolTransfer};
use anchor_spl::token::{self, Token, TokenAccount, Transfer as TokenTransfer};

declare_id!("7aa5fKvc4ejGWZdbxn8DmH5RVhofgwURXibcp3RtstAg");

#[program]
pub mod escrow {
    use super::*;

    pub fn deposit_to_escrow(
        ctx: Context<DepositToEscrow>,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(amount > 0, EscrowError::InvalidAmount);
        require!(!escrow.is_initialized, EscrowError::EscrowAlreadyInitialized);

        // Transfer USDC from tenant to escrow token account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenTransfer {
                from: ctx.accounts.tenant_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.tenant.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        escrow.rental_agreement = ctx.accounts.rental_agreement.key();
        escrow.tenant = ctx.accounts.tenant.key();
        escrow.landlord = ctx.accounts.landlord.key();
        escrow.escrow_token_account = ctx.accounts.escrow_token_account.key();
        escrow.amount = amount;
        escrow.is_released = false;
        escrow.is_initialized = true;
        escrow.bump = ctx.bumps.escrow;
        escrow.created_at = Clock::get()?.unix_timestamp;

        emit!(EscrowCreated {
            escrow: escrow.key(),
            rental_agreement: escrow.rental_agreement,
            tenant: escrow.tenant,
            landlord: escrow.landlord,
            amount: escrow.amount,
        });

        Ok(())
    }

    pub fn release_to_tenant(ctx: Context<ReleaseToTenant>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(escrow.is_initialized, EscrowError::EscrowNotInitialized);
        require!(!escrow.is_released, EscrowError::EscrowAlreadyReleased);

        let seeds = &[
            b"escrow",
            escrow.rental_agreement.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer SOL from escrow PDA back to tenant
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            SolTransfer {
                from: escrow.to_account_info(),
                to: ctx.accounts.tenant.to_account_info(),
            },
            signer,
        );
        transfer(transfer_ctx, escrow.amount)?;

        escrow.is_released = true;

        emit!(EscrowReleased {
            escrow: escrow.key(),
            recipient: escrow.tenant,
            amount: escrow.amount,
            released_to: ReleaseType::Tenant,
        });

        Ok(())
    }

    pub fn release_to_landlord(ctx: Context<ReleaseToLandlord>, amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(escrow.is_initialized, EscrowError::EscrowNotInitialized);
        require!(!escrow.is_released, EscrowError::EscrowAlreadyReleased);
        require!(amount <= escrow.amount, EscrowError::InsufficientFunds);

        let seeds = &[
            b"escrow",
            escrow.rental_agreement.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer SOL from escrow PDA to landlord
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            SolTransfer {
                from: escrow.to_account_info(),
                to: ctx.accounts.landlord.to_account_info(),
            },
            signer,
        );
        transfer(transfer_ctx, amount)?;

        escrow.is_released = true;

        emit!(EscrowReleased {
            escrow: escrow.key(),
            recipient: escrow.landlord,
            amount,
            released_to: ReleaseType::Landlord,
        });

        Ok(())
    }

    pub fn partial_deduct(
        ctx: Context<PartialDeduct>,
        landlord_amount: u64,
        reason: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(escrow.is_initialized, EscrowError::EscrowNotInitialized);
        require!(!escrow.is_released, EscrowError::EscrowAlreadyReleased);
        require!(landlord_amount < escrow.amount, EscrowError::InvalidAmount);
        require!(reason.len() <= 500, EscrowError::ReasonTooLong);

        let tenant_amount = escrow.amount - landlord_amount;

        let seeds = &[
            b"escrow",
            escrow.rental_agreement.as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer SOL to landlord
        let transfer_to_landlord = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            SolTransfer {
                from: escrow.to_account_info(),
                to: ctx.accounts.landlord.to_account_info(),
            },
            signer,
        );
        transfer(transfer_to_landlord, landlord_amount)?;

        // Transfer remaining SOL to tenant
        let transfer_to_tenant = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            SolTransfer {
                from: escrow.to_account_info(),
                to: ctx.accounts.tenant.to_account_info(),
            },
            signer,
        );
        transfer(transfer_to_tenant, tenant_amount)?;

        escrow.is_released = true;

        emit!(PartialDeduction {
            escrow: escrow.key(),
            landlord: escrow.landlord,
            tenant: escrow.tenant,
            landlord_amount,
            tenant_amount,
            reason,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositToEscrow<'info> {
    #[account(
        init,
        payer = tenant,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", rental_agreement.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: Rental agreement from rental-agreement program
    pub rental_agreement: UncheckedAccount<'info>,

    #[account(mut)]
    pub tenant: Signer<'info>,

    /// CHECK: Landlord public key
    pub landlord: UncheckedAccount<'info>,

    #[account(mut)]
    pub tenant_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseToTenant<'info> {
    #[account(
        mut,
        has_one = landlord,
        has_one = tenant,
        seeds = [b"escrow", escrow.rental_agreement.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub landlord: Signer<'info>,

    /// CHECK: Tenant public key
    #[account(mut)]
    pub tenant: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseToLandlord<'info> {
    #[account(
        mut,
        has_one = landlord,
        seeds = [b"escrow", escrow.rental_agreement.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub landlord: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PartialDeduct<'info> {
    #[account(
        mut,
        has_one = landlord,
        has_one = tenant,
        seeds = [b"escrow", escrow.rental_agreement.as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub landlord: Signer<'info>,

    /// CHECK: Tenant public key
    #[account(mut)]
    pub tenant: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub rental_agreement: Pubkey,   // 32
    pub tenant: Pubkey,             // 32
    pub landlord: Pubkey,           // 32
    pub escrow_token_account: Pubkey, // 32
    pub amount: u64,                // 8
    pub is_released: bool,          // 1
    pub is_initialized: bool,       // 1
    pub bump: u8,                   // 1
    pub created_at: i64,            // 8
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub rental_agreement: Pubkey,
    pub tenant: Pubkey,
    pub landlord: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowReleased {
    pub escrow: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub released_to: ReleaseType,
}

#[event]
pub struct PartialDeduction {
    pub escrow: Pubkey,
    pub landlord: Pubkey,
    pub tenant: Pubkey,
    pub landlord_amount: u64,
    pub tenant_amount: u64,
    pub reason: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReleaseType {
    Tenant,
    Landlord,
}

#[error_code]
pub enum EscrowError {
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Escrow is not initialized")]
    EscrowNotInitialized,
    #[msg("Escrow has already been released")]
    EscrowAlreadyReleased,
    #[msg("Escrow is already initialized")]
    EscrowAlreadyInitialized,
    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,
    #[msg("Reason is too long (max 500 characters)")]
    ReasonTooLong,
}
