# Chapter 23 : Fungible Asset 1.2

<dialog character="mechanics">Captain, why are you trying to change the part yourself? Just write a function on the terminal and send it to a droid.</dialog>

## Definition

A financial asset is a non-physical asset whose value is derived from a contractual claim, such as bank deposits, bonds, and stocks. Financial assets are usually more liquid than other tangible assets, such as commodities or real estate, and may be traded on financial markets.

Financial assets are opposed to non-financial assets, property rights which include both tangible property (sometimes also called real assets) such as land, real estate or commodities and intangible assets such as intellectual property, like copyrights, patents, Trademarks etc. 

### Fungible and non-fungible

When talking about *token* or *crypto-currency*, it is a numerical asset emitted on a blockchain.

Fungible means secable 

Fungible token is a financial asset where account balance represents the value associated to an _address_. This value can be splitted into smaller parts which can be transfered to another account.

Non-fungible token (NFT) is a financial asset whose balance cannot be splitted into smaller part. Crypto-kitties is an exemple of non fungible token (on Ethereum blcockchain). For exemple, a video game avatar (such as avatar on world of warcraft) is a character having some skills/attributes (strength, dexterity, ...) one can want to sell its avatar , but cannot sell strength property of its avatar separately. It makes sense to keep tha whole avatar into a unsecable set of attributes. 

### Standard

A standard is a set of rules commonly accepted by the community. 
The rules of financial asset describes how to create currencies (and transfer between accounts, etc). 

Depending on the usage of the currency, many sets of rules have been commonly accepted :
* Financial asset 1.2 (FA1.2) are rules for fungible token.
* Financia asset 2.0 (FA20) are rules for non fungible token.

For exemple, the creation of a crypto-currency is equivalent to creating a contract which supports the FA1.2 standard.
All smart contracts supporting the FA12 standard can interact with account and other contracts by transfering coins of our crypto-currency.


Similarily for ethereum, fungible token rules have been specified in a Ethereum forum blog (Ethereum Request Comment) the 20th answer was describing  a good rule set and the ERC20 became the name for this standard (rule set).
ERC721 is the standard rule set for non-fungible token.

## FA1.2 (Implementation of standard)

This Fungible token standard provides basic functionality to transfer tokens, as well as allow tokens to be approved so they can be spent by another on-chain third party.

Possible actions :
  Appove - Sender can specify an amount of token that can be spent by someone else (from his account)
  Transfer - Transfer an amount a token from an account to another account (or third-party on-chain smart contract)
  GetAllowance - Return the amount that can be spent by someone from sender's account 
  GetBalance - Returns sender's account balance
  GetTotalSupply - Returns the number total of token


Let's see implementation in PascalLigo of a fungible token (FA1.2) 

```
// This is an implimentation of the FA1.2 specification in PascaLIGO

type amt is nat;

type account is record
    balance : amt;
    allowances: map(address, amt);
end

type action is
| Transfer of (address * address * amt)
| Approve of (address * amt)
| GetAllowance of (address * address * contract(amt))
| GetBalance of (address * contract(amt))
| GetTotalSupply of (unit * contract(amt))

type contract_storage is record
  totalSupply: amt;
  ledger: big_map(address, account);
end

function isAllowed ( const src : address ; const value : amt ; var s : contract_storage) : bool is 
  begin
    var allowed: bool := False;
    if sender =/= source then block {
      const src: account = get_force(src, s.ledger);
      const allowanceAmount: amt = get_force(sender, src.allowances);
      allowed := allowanceAmount >= value;
    };
    else allowed := True;
  end with allowed

// Transfer a specific amount of tokens from the accountFrom address to a destination address
// Pre conditions:
//  The sender address is the account owner or is allowed to spend x in the name of accountFrom
//  The accountFrom account has a balance higher than amount
// Post conditions:
//  The balance of accountFrom is decreased by amount
//  The balance of destination is increased by amount
function transfer (const accountFrom : address ; const destination : address ; const value : amt ; var s : contract_storage) : contract_storage is
 begin  
  // If accountFrom = destination transfer is not necessary
  if accountFrom = destination then skip;
  else block {
    // Is sender allowed to spend value in the name of source
    case isAllowed(accountFrom, value, s) of 
    | False -> failwith ("Sender not allowed to spend token from source")
    | True -> skip
    end;

    // Fetch src account
    const src: account = get_force(accountFrom, s.ledger);

    // Check that the source can spend that much
    if value > src.balance 
    then failwith ("Source balance is too low");
    else skip;

    // Update the source balance
    // Using the abs function to convert int to nat
    src.balance := abs(src.balance - value);

    s.ledger[accountFrom] := src;

    // Fetch dst account or add empty dst account to ledger
    var dst: account := record 
        balance = 0n;
        allowances = (map end : map(address, amt));
    end;
    case s.ledger[destination] of
    | None -> skip
    | Some(n) -> dst := n
    end;

    // Update the destination balance
    dst.balance := dst.balance + value;

    // Decrease the allowance amount if necessary
    if accountFrom =/= sender then block {
        const allowanceAmount: amt = get_force(sender, src.allowances);
        if allowanceAmount - value < 0 then failwith ("Allowance amount cannot be negative");
        else src.allowances[sender] := abs(allowanceAmount - value);
    } else skip;

    s.ledger[destination] := dst;
  }
 end with s

// Approve an amount to be spent by another address in the name of the sender
// Pre conditions:
//  The spender account is not the sender account
// Post conditions:
//  The allowance of spender in the name of sender is value
function approve (const spender : address ; const value : amt ; var s : contract_storage) : contract_storage is
 begin
  // If sender is the spender approving is not necessary
  if sender = spender then skip;
  else block {
    const src: account = get_force(sender, s.ledger);
    src.allowances[spender] := value;
    s.ledger[sender] := src; // Not sure if this last step is necessary
  }
 end with s

// View function that forwards the allowance amount of spender in the name of tokenOwner to a contract
// Pre conditions:
//  None
// Post conditions:
//  The state is unchanged
function getAllowance (const owner : address ; const spender : address ; const contr : contract(amt) ; var s : contract_storage) : list(operation) is
 begin
  const src: account = get_force(owner, s.ledger);
  const destAllowance: amt = get_force(spender, src.allowances);
 end with list [transaction(destAllowance, 0tz, contr)]

// View function that forwards the balance of source to a contract
// Pre conditions:
//  None
// Post conditions:
//  The state is unchanged
function getBalance (const src : address ; const contr : contract(amt) ; var s : contract_storage) : list(operation) is
 begin
  const src: account = get_force(src, s.ledger);
 end with list [transaction(src.balance, 0tz, contr)]

// View function that forwards the totalSupply to a contract
// Pre conditions:
//  None
// Post conditions:
//  The state is unchanged
function getTotalSupply (const contr : contract(amt) ; var s : contract_storage) : list(operation) is
  list [transaction(s.totalSupply, 0tz, contr)]

function main (const p : action ; const s : contract_storage) :
  (list(operation) * contract_storage) is
 block { 
   // Reject any transaction that try to transfer token to this contract
   if amount =/= 0tz then failwith ("This contract do not accept token");
   else skip;
  } with case p of
  | Transfer(n) -> ((nil : list(operation)), transfer(n.0, n.1, n.2, s))
  | Approve(n) -> ((nil : list(operation)), approve(n.0, n.1, s))
  | GetAllowance(n) -> (getAllowance(n.0, n.1, n.2, s), s)
  | GetBalance(n) -> (getBalance(n.0, n.1, s), s)
  | GetTotalSupply(n) -> (getTotalSupply(n.1, s), s)
  end
```



## Your mission

Let's assume the *TezosAcamedyToken* has been deployed. 

Consider your account is *me* (at address tz1SdT62G8tQp9fdHh4f2m4VtL8aGG6NUcmJ) which has been granted 1000000 token. 
Consider alice account (at address tz1NiAGZgRV8F1E3qYFEPgajntzTRDYkU9h7)

<!-- prettier-ignore -->1- We want you to simulate the transfer of 2 TAT (Tezos Academy Token) to *alice*. Write a ligo command line for preparing a simulated storage where you (tz1SdT62G8tQp9fdHh4f2m4VtL8aGG6NUcmJ) possess 1000000 of token and no allowances.

<!-- prettier-ignore -->2- Write a ligo command line for preparing invocation of an *Approval* of 2 TAT (Tezos Academy Token) for *alice*.

<!-- prettier-ignore -->3- Write a ligo command line that simulate your invocation of previous *Approval* on storage prepared at step 1. (Don't forget to specify that you are sending this transaction).

<!-- prettier-ignore -->4- Now that ligo compiler ensured us that simulation is good, we will try to simulate it with the tezos-client command line in order to know the right amount of gas needed to run execute *approval*. You can consider that step 2 produced the following michelson expression:
```
(Left (Left (Left (Pair "tz1NiAGZgRV8F1E3qYFEPgajntzTRDYkU9h7" 2))))
```
<!-- prettier-ignore -->5-Write a tezos command line that simulate your invocation.

<!-- prettier-ignore -->6-  Now that approval has been exeucted on blockchain, 2 TAT can be transfered from your address to *alice*. Write a ligo command line for preparing invocation of a *Transfer* of 2 TAT (Tezos Academy Token) from you to *alice*.

<!-- prettier-ignore -->7- Write a ligo command line for preparing a simulated storage where you (tz1SdT62G8tQp9fdHh4f2m4VtL8aGG6NUcmJ) possess 1000000 of token and allowances is initialized with 2 TAT that can be transfered from *me* to *alice* (tz1NiAGZgRV8F1E3qYFEPgajntzTRDYkU9h7).

<!-- prettier-ignore -->8- Write a ligo command line that simulate your invocation of previous *Transfer* on storage prepared at step 7. (Don't forget to specify that you are sending this transaction).

<!-- prettier-ignore -->9- Now that ligo compiler ensured us that simulation is good, we will try to simulate it with the tezos-client command line in order to know the right amount of gas needed to run execute *transfer*. You can consider that step 6 produces the following michelson expression:
```
(Right (Pair (Pair "tz1SdT62G8tQp9fdHh4f2m4VtL8aGG6NUcmJ" "tz1NiAGZgRV8F1E3qYFEPgajntzTRDYkU9h7") 2))
```

<!-- prettier-ignore -->10-Write a tezos command line that simulate your *Transfer* invocation.