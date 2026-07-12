#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};
#[contract]
pub struct ScholarshipEscrow;
#[contractimpl]
impl ScholarshipEscrow {
    pub fn fund(env: Env, donor: Address, scholarship_id: u32, amount: i128) { donor.require_auth(); let key=(symbol_short!("bal"), scholarship_id); let current:i128=env.storage().persistent().get(&key).unwrap_or(0); env.storage().persistent().set(&key, &(current+amount)); env.events().publish((Symbol::new(&env,"DonationMade"), donor), (scholarship_id, amount)); }
    pub fn release(env: Env, verifier: Address, student: Address, scholarship_id: u32, milestone_id: u32, amount: i128) { verifier.require_auth(); let released_key=(symbol_short!("rel"), scholarship_id); let released:i128=env.storage().persistent().get(&released_key).unwrap_or(0); env.storage().persistent().set(&released_key, &(released+amount)); env.events().publish((Symbol::new(&env,"FundsReleased"), student), (scholarship_id, milestone_id, amount)); }
    pub fn released(env: Env, scholarship_id: u32) -> i128 { env.storage().persistent().get(&(symbol_short!("rel"), scholarship_id)).unwrap_or(0) }
}
