# Chapter 28 : Financial Asset 2.0

<dialog character="mechanics">Captain, you may not know that buy our ship as been purchased as a financial asset.</dialog>

## Definition

There are multiple considerations while implementing a particular token smart contract. Tokens might be fungible or non-fungible. A variety of permission policies can be used to define how many tokens can be transferred, who can initiate a transfer, and who can receive tokens. A token contract can be designed to support a single token type (e.g. ERC-20 or ERC-721) or multiple token types (e.g. ERC-1155) to optimize batch transfers and atomic swaps of the tokens.

The FA2 standard proposes a _unified token contract interface_ that accommodates all mentioned concerns. It aims to provide significant expressivity to contract developers to create new types of tokens while maintaining a common interface standard for wallet integrators and external developers.

In the following chapter on Financial Asset 2.0 , we will focus on _TZIP-12_ which stands for the 12th Tezos Improvement Proposal (same as EIP-721 for Ethereum).

## Architecture

The FA2 standard proposes to leave it to implementers to handle common considerations such as defining the contract’s token type(s) (e.g. non-fungible vs. fungible vs. semi-fungible), administration and whitelisting, contract upgradability, and supply operations (e.g. mint/burn).

The FA2 standard also leaves to implementers to decide on architecture pattern for handling permissioning. Permission can be implemented

- in the the same contract as the core transfer behavior (i.e. a “monolith”),
- in a transfer hook to another contract,
- in a separate wrapper contract.

## Interface and library

The FA2 interface formalizes a standard way to design tokens and thus describes a list of entry points (that must be implemented) and data structures related to these entry points. A more detailed decription of the interface is broken down in following sections.

In addition to the FA2 interface, the FA2 standard provides helper functions to manipulate data structures involved in FA2 interface. The FA2 library contains helper functions for :

<!-- prettier-ignore -->* a generic behavior and transfer hook implementation (behavior based on *permissions\_descriptor*),

- converting data structures,
- defining hooks between contracts when transfer is emitted,
- defining operators for managing allowance.

## Entry points

Token contract implementing the FA2 standard MUST have the following entry points.

```
type fa2_entry_points is
  Transfer                of transfer_params
| Balance_of              of balance_of_params
| Token_metadata_registry of token_metadata_registry_params
| Permissions_descriptor  of permissions_descriptor_params
| Update_operators        of update_operator_params
| Is_operator             of is_operator_params
```

### Balance of

<!-- prettier-ignore -->FA2 token contracts MUST implement the _Balance of_ entry point which gets the balance of multiple account/token pairs (because FA2 supports multiple token).

```
| Balance_of of balance_of_params
```

<!-- prettier-ignore -->It accepts a list of *balance\_of\_requests* and a callback and sends back a list of *balance\_of\_response* records to a callback contract.

<!-- prettier-ignore -->If one of the specified *token\_ids* is not defined within the FA2 contract, the entry point MUST fail with the error mnemonic "TOKEN_UNDEFINED" (see section Error Handling).

#### Interface

The FA2 interface defines request/response parameters as follow :

```
type token_id is nat

type balance_of_request is record
   owner    :  address
;  token_id : token_id
end

type balance_of_response_ is record
  request : balance_of_request
; balance : nat
end

type balance_of_response is michelson_pair_right_comb(balance_of_response_)

type balance_of_params_ is record
  requests : list (balance_of_request)
; callback : contract (list (balance_of_response))
end
```

### Transfer

FA2 token contracts MUST implement the _Transfer_ entry point which transfers tokens between owners and MUST ensure following rules.

```
Transfer of transfer_params
```

#### Rules

FA2 token contracts MUST implement the transfer logic defined by the following rules :

1. Every transfer operation MUST be atomic. If the operation fails, all token transfers MUST be reverted, and token balances MUST remain unchanged.

2. The amount of a token transfer MUST NOT exceed the existing token owner's balance. If the transfer amount for the particular token type and token owner exceeds the existing balance, the whole transfer operation MUST fail with the error mnemonic "INSUFFICIENT_BALANCE"

3. Core transfer behavior MAY be extended. If additional constraints on tokens transfer are required, FA2 token contract implementation MAY invoke additional permission policies (transfer hook is the recommended design pattern to implement core behavior extension). (See Chapter FA2 - Hook). If the additional permission hook fails, the whole transfer operation MUST fail with a custom error mnemonic.

4. Core transfer behavior MUST update token balances exactly as the operation parameters specify it. No changes to amount values or additional transfers are allowed.

#### Interface

It transfers tokens from a \_from\_\_ account to possibly many destination accounts where each destination transfer describes the type of token, the amount of token, and receiver address.

```
type token_id = nat

type transfer_destination = {
  to_ : address;
  token_id : token_id;
  amount : nat;
}

type transfer_destination_michelson = transfer_destination michelson_pair_right_comb

type transfer = {
  from_ : address;
  txs : transfer_destination list;
}

type transfer_aux = {
  from_ : address;
  txs : transfer_destination_michelson list;
}
```

### Metadata

<!-- prettier-ignore -->FA2 token contracts MUST implement the *token\_metadata\_registry* entry point which gets the metadata for multiple token types.

<!-- prettier-ignore -->It expects a callback contract, and sends back a list of *token\_metadata* records.

FA2 token amounts are represented by natural numbers (nat), and their granularity (the smallest amount of tokens which may be minted, burned, or transferred) is always 1.

The _decimals_ property is the number of digits to use after the decimal point when displaying the token amounts. If 0, the asset is not divisible. Decimals are used for display purposes only and MUST NOT affect transfer operation.

#### Interface

```
type token_metadata_ is record
  token_id  : token_id
; symbol    : string
; name      : string
; decimals  : nat
; extras    : map (string, string)
end

type token_metadata is michelson_pair_right_comb(token_metadata_)


type token_metadata_param is record
  token_ids : list(token_id);
  callback : contract(list(token_metadata)) ;
end
```

### Error Handling

This FA2 standard defines the set of standard errors to make it easier to integrate FA2 contracts with wallets, DApps and other generic software, and enable localization of user-visible error messages.

Each error code is a short abbreviated string mnemonic. An FA2 contract client (like another contract or a wallet) could use on-the-chain or off-the-chain registry to map the error code mnemonic to a user-readable, localized message.

A particular implementation of the FA2 contract MAY extend the standard set of errors with custom mnemonics for additional constraints.

When error occurs, any FA2 contract entry point MUST fail with one of the following types:

- string value which represents an error code mnemonic.
- a Michelson pair, where the first element is a string representing error code mnemonic and the second element is a custom error data.

### Standard error mnemonics:

<!-- prettier-ignore -->*TOKEN\_UNDEFINED* - One of the specified *token\_ids* is not defined within the FA2 contract

<!-- prettier-ignore -->*INSUFFICIENT\_BALANCE* - A token owner does not have sufficient balance to transfer tokens from owner's account

<!-- prettier-ignore -->*TX\_DENIED* - A transfer failed because of *operator\_transfer\_policy* == *No\_transfer*

<!-- prettier-ignore -->*NOT\_OWNER* - A transfer failed because *operator\_transfer\_policy* == *Owner\_transfer* and it is initiated not by the token owner

<!-- prettier-ignore -->*NOT\_OPERATOR* - A transfer failed because *operator\_transfer\_policy* == *Owner\_or\_operator\_transfer* and it is initiated neither by the token owner nor a permitted operator

<!-- prettier-ignore -->*RECEIVER\_HOOK\_FAILED* - The receiver hook failed. This error MUST be raised by the hook implementation

<!-- prettier-ignore -->*SENDER\_HOOK\_FAILED* - The sender failed. This error MUST be raised by the hook implementation

<!-- prettier-ignore -->*RECEIVER\_HOOK\_UNDEFINED* -Receiver hook is required by the permission behavior, but is not implemented by a receiver contract

<!-- prettier-ignore -->*SENDER\_HOOK\_UNDEFINED* - Sender hook is required by the permission behavior, but is not implemented by a sender contract

## Your mission

<!-- prettier-ignore -->We are working on a fungible token compliant with the FA2 standard. We want you to complete the existing implementation of our token. The *Balance\_Of* entry point is not yet implemented , please finish the job !

<!-- prettier-ignore -->The function *retreive\_balance* is responsible for processing each request and providing a response to each request. As you can see, a request is of type *balance\_of\_request*

<!-- prettier-ignore -->1- Declare a variable *retreived\_balance* of type natural initialized to 0.

<!-- prettier-ignore -->2- Retrieve the balance associated to the request owner in the ledger and store it in the variable *retreived\_balance*. In the _case_ instruction use *ledger_balance* as a temporary name for the _Some_. If no balance is retrieved, do nothing (do not modify *retreived\_balance*).

<!-- prettier-ignore -->3- Create a constant *response* of type *balance\_of\_response* containing a record with the request and the retrieved balance.

<!-- prettier-ignore -->4- The function *retreive\_balance* must return a type *balance\_of\_response*. You can use the *convert\_to\_right\_comb* function (seen in Chapter Interoperability) to convert constant *response* into the right format. Don't forget to cast *response* as type *balance\_of\_response*.
