use anchor_lang::prelude::*;

declare_id!("5d3VC6f3bRHUZcos7GdA6fmj8Xtuhf2oSCDD988kmDWs");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum PropertyStatus {
    Available,   // 0 - Can be rented
    Rented,      // 1 - Currently rented with active lease
    Deactivated, // 2 - Deactivated by landlord
}

#[program]
pub mod property_registry {
    use super::*;

    pub fn create_listing(
        ctx: Context<CreateListing>,
        property_id: u64,
        rent_amount: u64,
        deposit_amount: u64,
        lease_duration: i64,
        metadata_uri: String,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;

        require!(rent_amount > 0, PropertyError::InvalidRentAmount);
        require!(deposit_amount > 0, PropertyError::InvalidDepositAmount);
        require!(lease_duration > 0, PropertyError::InvalidLeaseDuration);
        require!(metadata_uri.len() <= 200, PropertyError::MetadataUriTooLong);

        property.landlord = ctx.accounts.landlord.key();
        property.property_id = property_id;
        property.rent_amount = rent_amount;
        property.deposit_amount = deposit_amount;
        property.lease_duration = lease_duration;
        property.status = PropertyStatus::Available;
        property.is_available = true;
        property.is_verified = false;
        property.verification_level = 0;
        property.metadata_uri = metadata_uri;
        property.document_hash = String::new();
        property.total_rentals = 0;
        property.successful_rentals = 0;
        property.bump = ctx.bumps.property;
        property.created_at = Clock::get()?.unix_timestamp;

        emit!(PropertyCreated {
            property: property.key(),
            landlord: property.landlord,
            property_id: property.property_id,
            rent_amount: property.rent_amount,
            deposit_amount: property.deposit_amount,
        });

        Ok(())
    }

    pub fn update_listing(
        ctx: Context<UpdateListing>,
        rent_amount: Option<u64>,
        deposit_amount: Option<u64>,
        lease_duration: Option<i64>,
        status: Option<PropertyStatus>,
        metadata_uri: Option<String>,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;

        if let Some(amount) = rent_amount {
            require!(amount > 0, PropertyError::InvalidRentAmount);
            property.rent_amount = amount;
        }

        if let Some(amount) = deposit_amount {
            require!(amount > 0, PropertyError::InvalidDepositAmount);
            property.deposit_amount = amount;
        }

        if let Some(duration) = lease_duration {
            require!(duration > 0, PropertyError::InvalidLeaseDuration);
            property.lease_duration = duration;
        }

        if let Some(new_status) = status {
            property.status = new_status;
            // Keep is_available in sync for backward compatibility
            property.is_available = new_status == PropertyStatus::Available;
        }

        if let Some(uri) = metadata_uri {
            require!(uri.len() <= 200, PropertyError::MetadataUriTooLong);
            property.metadata_uri = uri;
        }

        emit!(PropertyUpdated {
            property: property.key(),
            landlord: property.landlord,
        });

        Ok(())
    }

    pub fn deactivate_listing(ctx: Context<DeactivateListing>) -> Result<()> {
        let property = &mut ctx.accounts.property;
        property.status = PropertyStatus::Deactivated;
        property.is_available = false;

        emit!(PropertyDeactivated {
            property: property.key(),
            landlord: property.landlord,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(property_id: u64)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = landlord,
        space = 8 + Property::INIT_SPACE,
        seeds = [b"property", landlord.key().as_ref(), property_id.to_le_bytes().as_ref()],
        bump
    )]
    pub property: Account<'info, Property>,

    #[account(mut)]
    pub landlord: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateListing<'info> {
    #[account(
        mut,
        has_one = landlord,
        seeds = [b"property", landlord.key().as_ref(), property.property_id.to_le_bytes().as_ref()],
        bump = property.bump
    )]
    pub property: Account<'info, Property>,

    pub landlord: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateListing<'info> {
    #[account(
        mut,
        has_one = landlord,
        seeds = [b"property", landlord.key().as_ref(), property.property_id.to_le_bytes().as_ref()],
        bump = property.bump
    )]
    pub property: Account<'info, Property>,

    pub landlord: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Property {
    pub landlord: Pubkey,           // 32
    pub property_id: u64,           // 8
    pub rent_amount: u64,           // 8 (in lamports/smallest unit of USDC)
    pub deposit_amount: u64,        // 8
    pub lease_duration: i64,        // 8 (in seconds)
    pub status: PropertyStatus,     // 1 + 1 - Enum status
    pub is_available: bool,         // 1 - Kept for backward compatibility
    pub is_verified: bool,          // 1 - Property verification status
    pub verification_level: u8,     // 1 - 0=none, 1=basic, 2=full
    #[max_len(200)]
    pub metadata_uri: String,       // 4 + 200
    #[max_len(100)]
    pub document_hash: String,      // 4 + 100 - IPFS/Arweave hash
    pub total_rentals: u32,         // 4 - Track rental history
    pub successful_rentals: u32,    // 4 - Track successful completions
    pub bump: u8,                   // 1
    pub created_at: i64,            // 8
}

#[event]
pub struct PropertyCreated {
    pub property: Pubkey,
    pub landlord: Pubkey,
    pub property_id: u64,
    pub rent_amount: u64,
    pub deposit_amount: u64,
}

#[event]
pub struct PropertyUpdated {
    pub property: Pubkey,
    pub landlord: Pubkey,
}

#[event]
pub struct PropertyDeactivated {
    pub property: Pubkey,
    pub landlord: Pubkey,
}

#[error_code]
pub enum PropertyError {
    #[msg("Rent amount must be greater than 0")]
    InvalidRentAmount,
    #[msg("Deposit amount must be greater than 0")]
    InvalidDepositAmount,
    #[msg("Lease duration must be greater than 0")]
    InvalidLeaseDuration,
    #[msg("Metadata URI is too long (max 200 characters)")]
    MetadataUriTooLong,
}
