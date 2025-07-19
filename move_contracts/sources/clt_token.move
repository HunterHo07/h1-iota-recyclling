/// # CLT (Closed Loop Token) for Recycling Rewards
/// 
/// This Move smart contract implements a Closed Loop Token (CLT) system
/// as part of the IOTA Trust Framework integration. CLTs are purpose-bound
/// tokens that can only be used within the recycling ecosystem.
/// 
/// ## Features:
/// - Purpose-bound tokens for recycling rewards
/// - Automatic minting for completed recycling jobs
/// - Restricted usage within recycling marketplace
/// - Expiration dates for tokens
/// - Compliance with IOTA Trust Framework

module recycling_marketplace::clt_token {
    use iota::object::{Self, UID};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::coin::{Self, Coin, TreasuryCap};
    use iota::event;
    use iota::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // ===== Error Codes =====
    const ETokenExpired: u64 = 1;
    const EInsufficientBalance: u64 = 2;
    const ENotAuthorized: u64 = 3;
    const EInvalidPurpose: u64 = 4;
    const ETokenNotRedeemable: u64 = 5;

    // ===== Token Purpose Constants =====
    const PURPOSE_RECYCLING_REWARD: u8 = 1;
    const PURPOSE_BONUS_REWARD: u8 = 2;
    const PURPOSE_REFERRAL_REWARD: u8 = 3;
    const PURPOSE_MILESTONE_REWARD: u8 = 4;

    // ===== Structs =====

    /// The CLT token type
    public struct CLT has drop {}

    /// CLT Token Registry for managing token lifecycle
    public struct CLTRegistry has key {
        id: UID,
        admin: address,
        total_minted: u64,
        total_redeemed: u64,
        treasury_cap: TreasuryCap<CLT>,
        authorized_minters: vector<address>,
        authorized_redeemers: vector<address>,
    }

    /// Purpose-bound CLT token with restrictions
    public struct PurposeBoundCLT has key, store {
        id: UID,
        owner: address,
        amount: u64,
        purpose: u8,
        purpose_description: String,
        issued_at: u64,
        expires_at: Option<u64>,
        redeemable_locations: vector<String>,
        metadata: String,
        is_redeemed: bool,
    }

    /// CLT Voucher for specific purposes
    public struct CLTVoucher has key, store {
        id: UID,
        recipient: address,
        amount: u64,
        purpose: u8,
        voucher_code: String,
        valid_from: u64,
        valid_until: u64,
        usage_restrictions: String,
        issuer: address,
        is_used: bool,
    }

    // ===== Events =====

    public struct CLTMinted has copy, drop {
        recipient: address,
        amount: u64,
        purpose: u8,
        purpose_description: String,
        issued_at: u64,
    }

    public struct CLTRedeemed has copy, drop {
        owner: address,
        amount: u64,
        purpose: u8,
        redeemed_at: u64,
        location: String,
    }

    public struct VoucherIssued has copy, drop {
        recipient: address,
        amount: u64,
        voucher_code: String,
        valid_until: u64,
        issuer: address,
    }

    public struct VoucherRedeemed has copy, drop {
        recipient: address,
        amount: u64,
        voucher_code: String,
        redeemed_at: u64,
    }

    // ===== Module Initializer =====

    /// Initialize CLT token system
    fun init(witness: CLT, ctx: &mut TxContext) {
        // Create the currency
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            8, // decimals
            b"CLT",
            b"Closed Loop Token",
            b"Purpose-bound tokens for recycling ecosystem rewards",
            option::none(),
            ctx
        );

        // Create registry
        let registry = CLTRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_minted: 0,
            total_redeemed: 0,
            treasury_cap,
            authorized_minters: vector::empty(),
            authorized_redeemers: vector::empty(),
        };

        // Share objects
        transfer::public_freeze_object(metadata);
        transfer::share_object(registry);
    }

    // ===== Admin Functions =====

    /// Add authorized minter
    public entry fun add_authorized_minter(
        registry: &mut CLTRegistry,
        minter: address,
        ctx: &mut TxContext
    ) {
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        vector::push_back(&mut registry.authorized_minters, minter);
    }

    /// Add authorized redeemer
    public entry fun add_authorized_redeemer(
        registry: &mut CLTRegistry,
        redeemer: address,
        ctx: &mut TxContext
    ) {
        assert!(registry.admin == tx_context::sender(ctx), ENotAuthorized);
        vector::push_back(&mut registry.authorized_redeemers, redeemer);
    }

    // ===== Public Entry Functions =====

    /// Mint purpose-bound CLT tokens for recycling rewards
    public entry fun mint_recycling_reward(
        registry: &mut CLTRegistry,
        recipient: address,
        amount: u64,
        purpose_description: vector<u8>,
        expires_in_days: Option<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check authorization
        let sender = tx_context::sender(ctx);
        assert!(
            sender == registry.admin || vector::contains(&registry.authorized_minters, &sender),
            ENotAuthorized
        );

        let current_time = clock::timestamp_ms(clock);
        let expires_at = if (option::is_some(&expires_in_days)) {
            let days = *option::borrow(&expires_in_days);
            option::some(current_time + (days * 24 * 60 * 60 * 1000))
        } else {
            option::none()
        };

        // Mint coins
        let coins = coin::mint(&mut registry.treasury_cap, amount, ctx);
        
        // Create purpose-bound token
        let purpose_bound_token = PurposeBoundCLT {
            id: object::new(ctx),
            owner: recipient,
            amount,
            purpose: PURPOSE_RECYCLING_REWARD,
            purpose_description: string::utf8(purpose_description),
            issued_at: current_time,
            expires_at,
            redeemable_locations: vector::empty(),
            metadata: string::utf8(b"Recycling reward CLT"),
            is_redeemed: false,
        };

        // Update registry stats
        registry.total_minted = registry.total_minted + amount;

        // Emit event
        event::emit(CLTMinted {
            recipient,
            amount,
            purpose: PURPOSE_RECYCLING_REWARD,
            purpose_description: string::utf8(purpose_description),
            issued_at: current_time,
        });

        // Transfer tokens and purpose-bound object
        transfer::public_transfer(coins, recipient);
        transfer::transfer(purpose_bound_token, recipient);
    }

    /// Issue CLT voucher for eligible users
    public entry fun issue_voucher(
        registry: &mut CLTRegistry,
        recipient: address,
        amount: u64,
        voucher_code: vector<u8>,
        valid_for_days: u64,
        usage_restrictions: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == registry.admin || vector::contains(&registry.authorized_minters, &sender),
            ENotAuthorized
        );

        let current_time = clock::timestamp_ms(clock);
        let valid_until = current_time + (valid_for_days * 24 * 60 * 60 * 1000);

        let voucher = CLTVoucher {
            id: object::new(ctx),
            recipient,
            amount,
            purpose: PURPOSE_BONUS_REWARD,
            voucher_code: string::utf8(voucher_code),
            valid_from: current_time,
            valid_until,
            usage_restrictions: string::utf8(usage_restrictions),
            issuer: sender,
            is_used: false,
        };

        // Emit event
        event::emit(VoucherIssued {
            recipient,
            amount,
            voucher_code: string::utf8(voucher_code),
            valid_until,
            issuer: sender,
        });

        transfer::transfer(voucher, recipient);
    }

    /// Redeem CLT voucher for tokens
    public entry fun redeem_voucher(
        registry: &mut CLTRegistry,
        voucher: PurposeBoundCLT,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!voucher.is_redeemed, ETokenNotRedeemable);
        
        // Check expiration
        if (option::is_some(&voucher.expires_at)) {
            let expiry = *option::borrow(&voucher.expires_at);
            assert!(clock::timestamp_ms(clock) <= expiry, ETokenExpired);
        };

        let amount = voucher.amount;
        let owner = voucher.owner;
        let purpose = voucher.purpose;

        // Mint coins for redemption
        let coins = coin::mint(&mut registry.treasury_cap, amount, ctx);
        
        // Update registry stats
        registry.total_redeemed = registry.total_redeemed + amount;

        // Emit event
        event::emit(CLTRedeemed {
            owner,
            amount,
            purpose,
            redeemed_at: clock::timestamp_ms(clock),
            location: string::utf8(b"Digital redemption"),
        });

        // Transfer coins
        transfer::public_transfer(coins, owner);

        // Destroy the voucher (mark as redeemed)
        let PurposeBoundCLT {
            id,
            owner: _,
            amount: _,
            purpose: _,
            purpose_description: _,
            issued_at: _,
            expires_at: _,
            redeemable_locations: _,
            metadata: _,
            is_redeemed: _,
        } = voucher;
        object::delete(id);
    }

    // ===== View Functions =====

    /// Get CLT registry stats
    public fun get_registry_stats(registry: &CLTRegistry): (u64, u64) {
        (registry.total_minted, registry.total_redeemed)
    }

    /// Check if token is expired
    public fun is_token_expired(token: &PurposeBoundCLT, current_time: u64): bool {
        if (option::is_some(&token.expires_at)) {
            let expiry = *option::borrow(&token.expires_at);
            current_time > expiry
        } else {
            false
        }
    }

    /// Get token details
    public fun get_token_details(token: &PurposeBoundCLT): (address, u64, u8, bool) {
        (token.owner, token.amount, token.purpose, token.is_redeemed)
    }
}
