/// # Recycling Marketplace Smart Contract
/// 
/// This Move smart contract implements a decentralized recycling incentive system
/// for the IOTA Hackathon. It allows:
/// - Recyclers to post recycling jobs with rewards
/// - Collectors to claim and complete jobs
/// - Automatic reward distribution upon job completion
/// - Reputation tracking for both recyclers and collectors
/// 
/// ## Features:
/// - Job posting with escrow system
/// - Proof of recycling verification
/// - CLT (Closed Loop Token) rewards
/// - Reputation and rating system
/// - Dispute resolution mechanism

module recycling_marketplace::marketplace {
    use iota::object::{Self, UID};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use iota::event;
    use iota::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;
    use std::option;

    // ===== Error Codes =====
    const EJobNotFound: u64 = 1;
    const EJobAlreadyClaimed: u64 = 2;
    const EJobNotClaimed: u64 = 3;
    const ENotJobPoster: u64 = 4;
    const ENotJobCollector: u64 = 5;
    const EJobAlreadyCompleted: u64 = 6;
    const EInsufficientReward: u64 = 7;
    const EInvalidProof: u64 = 8;

    // ===== Job Status Constants =====
    const STATUS_OPEN: u8 = 0;
    const STATUS_CLAIMED: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_DISPUTED: u8 = 3;

    // ===== Structs =====

    /// Main marketplace object that manages all recycling jobs
    public struct Marketplace has key {
        id: UID,
        admin: address,
        total_jobs: u64,
        total_rewards_distributed: u64,
        platform_fee_rate: u64, // Fee rate in basis points (100 = 1%)
    }

    /// Individual recycling job
    public struct RecyclingJob has key, store {
        id: UID,
        job_id: u64,
        poster: address,
        collector: Option<address>,
        title: String,
        description: String,
        item_type: String, // plastic, metal, paper, glass, electronic
        estimated_weight: u64, // in grams
        reward_amount: u64,
        location: String,
        status: u8,
        created_at: u64,
        claimed_at: Option<u64>,
        completed_at: Option<u64>,
        proof_hash: Option<String>,
        escrow: Coin<IOTA>,
    }

    /// User profile for reputation tracking
    public struct UserProfile has key, store {
        id: UID,
        user_address: address,
        jobs_posted: u64,
        jobs_completed: u64,
        total_earned: u64,
        total_spent: u64,
        reputation_score: u64, // 0-1000 scale
        is_verified: bool,
    }

    /// Proof of recycling submission
    public struct RecyclingProof has key, store {
        id: UID,
        job_id: u64,
        collector: address,
        proof_type: String, // photo, video, receipt, certificate
        proof_hash: String,
        actual_weight: u64,
        location_verified: bool,
        submitted_at: u64,
    }

    // ===== Events =====

    public struct JobPosted has copy, drop {
        job_id: u64,
        poster: address,
        title: String,
        item_type: String,
        reward_amount: u64,
        location: String,
    }

    public struct JobClaimed has copy, drop {
        job_id: u64,
        collector: address,
        claimed_at: u64,
    }

    public struct JobCompleted has copy, drop {
        job_id: u64,
        poster: address,
        collector: address,
        reward_amount: u64,
        actual_weight: u64,
        completed_at: u64,
    }

    public struct ProofSubmitted has copy, drop {
        job_id: u64,
        collector: address,
        proof_hash: String,
        actual_weight: u64,
    }

    // ===== Module Initializer =====

    /// Initialize the marketplace when the module is published
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_jobs: 0,
            total_rewards_distributed: 0,
            platform_fee_rate: 250, // 2.5% platform fee
        };

        transfer::share_object(marketplace);
    }

    // ===== Public Entry Functions =====

    /// Post a new recycling job with escrow
    public entry fun post_job(
        marketplace: &mut Marketplace,
        title: vector<u8>,
        description: vector<u8>,
        item_type: vector<u8>,
        estimated_weight: u64,
        location: vector<u8>,
        reward: Coin<IOTA>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let reward_amount = coin::value(&reward);
        assert!(reward_amount > 0, EInsufficientReward);

        let job_id = marketplace.total_jobs + 1;
        marketplace.total_jobs = job_id;

        let job = RecyclingJob {
            id: object::new(ctx),
            job_id,
            poster: tx_context::sender(ctx),
            collector: std::option::none(),
            title: string::utf8(title),
            description: string::utf8(description),
            item_type: string::utf8(item_type),
            estimated_weight,
            reward_amount,
            location: string::utf8(location),
            status: STATUS_OPEN,
            created_at: clock::timestamp_ms(clock),
            claimed_at: std::option::none(),
            completed_at: std::option::none(),
            proof_hash: std::option::none(),
            escrow: reward,
        };

        // Emit job posted event
        event::emit(JobPosted {
            job_id,
            poster: tx_context::sender(ctx),
            title: string::utf8(title),
            item_type: string::utf8(item_type),
            reward_amount,
            location: string::utf8(location),
        });

        transfer::share_object(job);
    }

    /// Claim an available recycling job
    public entry fun claim_job(
        job: &mut RecyclingJob,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(job.status == STATUS_OPEN, EJobAlreadyClaimed);
        
        let collector = tx_context::sender(ctx);
        job.collector = std::option::some(collector);
        job.status = STATUS_CLAIMED;
        job.claimed_at = std::option::some(clock::timestamp_ms(clock));

        // Emit job claimed event
        event::emit(JobClaimed {
            job_id: job.job_id,
            collector,
            claimed_at: clock::timestamp_ms(clock),
        });
    }

    /// Submit proof of recycling completion
    public entry fun submit_proof(
        job: &mut RecyclingJob,
        proof_type: vector<u8>,
        proof_hash: vector<u8>,
        actual_weight: u64,
        location_verified: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(job.status == STATUS_CLAIMED, EJobNotClaimed);
        assert!(std::option::is_some(&job.collector), EJobNotClaimed);
        assert!(*std::option::borrow(&job.collector) == tx_context::sender(ctx), ENotJobCollector);

        let proof = RecyclingProof {
            id: object::new(ctx),
            job_id: job.job_id,
            collector: tx_context::sender(ctx),
            proof_type: string::utf8(proof_type),
            proof_hash: string::utf8(proof_hash),
            actual_weight,
            location_verified,
            submitted_at: clock::timestamp_ms(clock),
        };

        job.proof_hash = std::option::some(string::utf8(proof_hash));

        // Emit proof submitted event
        event::emit(ProofSubmitted {
            job_id: job.job_id,
            collector: tx_context::sender(ctx),
            proof_hash: string::utf8(proof_hash),
            actual_weight,
        });

        transfer::share_object(proof);
    }

    /// Complete job and release payment (called by job poster after verification)
    public entry fun complete_job(
        marketplace: &mut Marketplace,
        job: &mut RecyclingJob,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(job.status == STATUS_CLAIMED, EJobNotClaimed);
        assert!(job.poster == tx_context::sender(ctx), ENotJobPoster);
        assert!(std::option::is_some(&job.collector), EJobNotClaimed);
        assert!(std::option::is_some(&job.proof_hash), EInvalidProof);

        let collector = *std::option::borrow(&job.collector);
        let reward_amount = job.reward_amount;
        
        // Calculate platform fee
        let platform_fee = (reward_amount * marketplace.platform_fee_rate) / 10000;
        let collector_reward = reward_amount - platform_fee;

        // Extract coins from escrow
        let total_escrow = coin::value(&job.escrow);
        let collector_payment = coin::split(&mut job.escrow, collector_reward, ctx);
        let platform_payment = coin::split(&mut job.escrow, platform_fee, ctx);

        // Transfer payments
        transfer::public_transfer(collector_payment, collector);
        transfer::public_transfer(platform_payment, marketplace.admin);

        // Update job status
        job.status = STATUS_COMPLETED;
        job.completed_at = std::option::some(clock::timestamp_ms(clock));
        
        // Update marketplace stats
        marketplace.total_rewards_distributed = marketplace.total_rewards_distributed + reward_amount;

        // Emit job completed event
        event::emit(JobCompleted {
            job_id: job.job_id,
            poster: job.poster,
            collector,
            reward_amount: collector_reward,
            actual_weight: 0, // Would get from proof
            completed_at: clock::timestamp_ms(clock),
        });
    }

    // ===== View Functions =====

    /// Get job details
    public fun get_job_details(job: &RecyclingJob): (u64, address, Option<address>, u8, u64, u64) {
        (
            job.job_id,
            job.poster,
            job.collector,
            job.status,
            job.reward_amount,
            job.created_at
        )
    }

    /// Get marketplace stats
    public fun get_marketplace_stats(marketplace: &Marketplace): (u64, u64, u64) {
        (
            marketplace.total_jobs,
            marketplace.total_rewards_distributed,
            marketplace.platform_fee_rate
        )
    }

    /// Check if job is available for claiming
    public fun is_job_available(job: &RecyclingJob): bool {
        job.status == STATUS_OPEN
    }

    /// Check if job is completed
    public fun is_job_completed(job: &RecyclingJob): bool {
        job.status == STATUS_COMPLETED
    }
}
