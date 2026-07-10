#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, Symbol, Vec};
#[contract]
pub struct ScholarshipFactory;
#[contractimpl]
impl ScholarshipFactory {
    pub fn create(env: Env, creator: Address, student: Address, metadata_uri: String, goal: i128) -> u32 {
        creator.require_auth();
        let mut next: u32 = env.storage().persistent().get(&symbol_short!("next")).unwrap_or(0);
        next += 1;
        env.storage().persistent().set(&(symbol_short!("sch"), next), &(creator.clone(), student.clone(), metadata_uri.clone(), goal));
        env.storage().persistent().set(&symbol_short!("next"), &next);
        env.events().publish((Symbol::new(&env, "ScholarshipCreated"), creator, student), (next, metadata_uri, goal));
        next
    }
    pub fn list_ids(env: Env) -> Vec<u32> { let max: u32 = env.storage().persistent().get(&symbol_short!("next")).unwrap_or(0); let mut ids = Vec::new(&env); for id in 1..=max { ids.push_back(id); } ids }
}
