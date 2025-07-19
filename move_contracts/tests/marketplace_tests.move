/// # Tests for Recycling Marketplace Smart Contracts
/// 
/// Comprehensive test suite for the recycling marketplace and CLT token contracts

#[test_only]
module recycling_marketplace::marketplace_tests {
    use recycling_marketplace::marketplace::{Self, Marketplace, RecyclingJob};
    use recycling_marketplace::clt_token::{Self, CLTRegistry, CLT};
    use iota::test_scenario::{Self, Scenario};
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use iota::clock::{Self, Clock};
    use std::string;

    // Test addresses
    const ADMIN: address = @0xA;
    const RECYCLER: address = @0xB;
    const COLLECTOR: address = @0xC;

    #[test]
    fun test_marketplace_initialization() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Initialize marketplace
        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        // Check marketplace was created
        test_scenario::next_tx(scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_shared<Marketplace>(), 0);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_job_posting() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Initialize marketplace
        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        // Create test clock
        test_scenario::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        // Post a job
        test_scenario::next_tx(scenario, RECYCLER);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let reward_coin = coin::mint_for_testing<IOTA>(1000, test_scenario::ctx(scenario));
            
            marketplace::post_job(
                &mut marketplace,
                b"Plastic Bottles Collection",
                b"Collect plastic bottles from downtown area",
                b"plastic",
                5000, // 5kg
                b"Downtown Plaza",
                reward_coin,
                &clock,
                test_scenario::ctx(scenario)
            );

            test_scenario::return_shared(marketplace);
        };

        // Verify job was created
        test_scenario::next_tx(scenario, RECYCLER);
        {
            assert!(test_scenario::has_most_recent_shared<RecyclingJob>(), 1);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_job_claiming() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Initialize and post job
        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        test_scenario::next_tx(scenario, RECYCLER);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let reward_coin = coin::mint_for_testing<IOTA>(1000, test_scenario::ctx(scenario));
            
            marketplace::post_job(
                &mut marketplace,
                b"Test Job",
                b"Test Description",
                b"plastic",
                1000,
                b"Test Location",
                reward_coin,
                &clock,
                test_scenario::ctx(scenario)
            );

            test_scenario::return_shared(marketplace);
        };

        // Claim the job
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            
            marketplace::claim_job(&mut job, &clock, test_scenario::ctx(scenario));
            
            // Verify job is claimed
            let (_, _, collector, status, _, _) = marketplace::get_job_details(&job);
            assert!(std::option::is_some(&collector), 2);
            assert!(status == 1, 3); // STATUS_CLAIMED
            
            test_scenario::return_shared(job);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_proof_submission() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Setup: Initialize, post job, claim job
        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        // Post and claim job
        test_scenario::next_tx(scenario, RECYCLER);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let reward_coin = coin::mint_for_testing<IOTA>(1000, test_scenario::ctx(scenario));
            
            marketplace::post_job(
                &mut marketplace,
                b"Test Job",
                b"Test Description", 
                b"plastic",
                1000,
                b"Test Location",
                reward_coin,
                &clock,
                test_scenario::ctx(scenario)
            );

            test_scenario::return_shared(marketplace);
        };

        test_scenario::next_tx(scenario, COLLECTOR);
        {
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            marketplace::claim_job(&mut job, &clock, test_scenario::ctx(scenario));
            test_scenario::return_shared(job);
        };

        // Submit proof
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            
            marketplace::submit_proof(
                &mut job,
                b"photo",
                b"QmHash123456789",
                1200, // actual weight
                true, // location verified
                &clock,
                test_scenario::ctx(scenario)
            );
            
            test_scenario::return_shared(job);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_job_completion() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Setup: Initialize, post job, claim job, submit proof
        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        // Post job
        test_scenario::next_tx(scenario, RECYCLER);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let reward_coin = coin::mint_for_testing<IOTA>(1000, test_scenario::ctx(scenario));
            
            marketplace::post_job(
                &mut marketplace,
                b"Test Job",
                b"Test Description",
                b"plastic", 
                1000,
                b"Test Location",
                reward_coin,
                &clock,
                test_scenario::ctx(scenario)
            );

            test_scenario::return_shared(marketplace);
        };

        // Claim job
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            marketplace::claim_job(&mut job, &clock, test_scenario::ctx(scenario));
            test_scenario::return_shared(job);
        };

        // Submit proof
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            marketplace::submit_proof(
                &mut job,
                b"photo",
                b"QmHash123456789",
                1200,
                true,
                &clock,
                test_scenario::ctx(scenario)
            );
            test_scenario::return_shared(job);
        };

        // Complete job
        test_scenario::next_tx(scenario, RECYCLER);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let job = test_scenario::take_shared<RecyclingJob>(scenario);
            
            marketplace::complete_job(&mut marketplace, &mut job, &clock, test_scenario::ctx(scenario));
            
            // Verify job is completed
            assert!(marketplace::is_job_completed(&job), 4);
            
            test_scenario::return_shared(marketplace);
            test_scenario::return_shared(job);
        };

        // Verify collector received payment
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            assert!(test_scenario::has_most_recent_for_address<Coin<IOTA>>(COLLECTOR), 5);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_clt_token_minting() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // Initialize CLT system
        {
            clt_token::init(clt_token::CLT {}, test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        // Mint CLT tokens
        test_scenario::next_tx(scenario, ADMIN);
        {
            let registry = test_scenario::take_shared<CLTRegistry>(scenario);
            
            clt_token::mint_recycling_reward(
                &mut registry,
                COLLECTOR,
                500, // amount
                b"Recycling job completion reward",
                std::option::some(30), // expires in 30 days
                &clock,
                test_scenario::ctx(scenario)
            );
            
            test_scenario::return_shared(registry);
        };

        // Verify tokens were minted
        test_scenario::next_tx(scenario, COLLECTOR);
        {
            assert!(test_scenario::has_most_recent_for_address<Coin<CLT>>(COLLECTOR), 6);
        };

        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_marketplace_stats() {
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        {
            marketplace::init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, ADMIN);
        {
            let marketplace = test_scenario::take_shared<Marketplace>(scenario);
            let (total_jobs, total_rewards, fee_rate) = marketplace::get_marketplace_stats(&marketplace);
            
            assert!(total_jobs == 0, 7);
            assert!(total_rewards == 0, 8);
            assert!(fee_rate == 250, 9); // 2.5%
            
            test_scenario::return_shared(marketplace);
        };

        test_scenario::end(scenario_val);
    }
}
