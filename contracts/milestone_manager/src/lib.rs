#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, Symbol};
#[contract]
pub struct MilestoneManager;
#[contractimpl]
impl MilestoneManager { pub fn create(env: Env, admin: Address, scholarship_id: u32, milestone_id: u32, title: String, amount: i128) { admin.require_auth(); env.storage().persistent().set(&(symbol_short!("mile"), scholarship_id, milestone_id), &(title, amount, false)); } pub fn approve(env: Env, verifier: Address, scholarship_id: u32, milestone_id: u32, proof_uri: String) { verifier.require_auth(); env.storage().persistent().set(&(symbol_short!("appr"), scholarship_id, milestone_id), &true); env.events().publish((Symbol::new(&env,"MilestoneApproved"), verifier), (scholarship_id, milestone_id, proof_uri)); } pub fn approved(env: Env, scholarship_id: u32, milestone_id: u32) -> bool { env.storage().persistent().get(&(symbol_short!("appr"), scholarship_id, milestone_id)).unwrap_or(false) } }
