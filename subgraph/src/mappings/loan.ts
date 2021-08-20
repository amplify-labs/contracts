import { dataSource, BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

import { LoanCreated } from '../../generated/Factory/FactoryAbi';
import { Repayed, Borrowed, Closed } from '../../generated/templates/Loan/LoanAbi';
import { Loan, Transaction } from '../../generated/schema';


export function createNewLoan(event: LoanCreated): void {
    let loan = new Loan(event.params.loan.toHex());

    loan.amount = event.params.amount;
    loan.debt = new BigInt(0);
    loan.factor = event.params.factor;
    loan.asset = event.params.tokenId.toHex()
    loan.pool = event.params.pool.toHex();
    loan.isClosed = false;
    loan.createdAt = event.block.timestamp;
    loan.transactions = [];

    loan.save();
}

export function handleLoanRepay(event: Repayed): void {
    let context = dataSource.context();
    let factor = context.getBytes("factor");
    let loan = Loan.load(context.getBytes("loan").toHex());

    if (loan) {
        loan.debt = loan.debt.minus(event.params.amount);
    }

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "REPAY",
        Address.fromString(loan.pool),
        factor,
        event.params.amount,
        event.block.timestamp);

    let currentTx = loan.transactions;
    currentTx.push(event.transaction.hash.toHex());
    loan.transactions = currentTx;

    loan.save();
}

export function handleLoanBorrow(event: Borrowed): void {
    let context = dataSource.context();
    let factor = context.getBytes("factor");
    let loan = Loan.load(context.getBytes("loan").toHex());

    if (loan) {
        loan.debt = event.params.amount;
    }
    handleAddTransaction(
        event.transaction.hash.toHex(),
        "BORROW",
        Address.fromString(loan.pool),
        factor,
        event.params.amount,
        event.block.timestamp);

    let currentTx = loan.transactions;
    currentTx.push(event.transaction.hash.toHex());
    loan.transactions = currentTx;

    loan.save();
}

export function handleLoanClose(_: Closed): void {
    let context = dataSource.context();
    let loan = Loan.load(context.getBytes("loan").toHex());

    if (loan) {
        loan.isClosed = true;
    }
    loan.save();
}


function handleAddTransaction(txId: string, type: string, from: Bytes, to: Bytes, amount: BigInt, timestamp: BigInt): void {
    let transaction = new Transaction(txId);
    transaction.from = from;
    transaction.to = to;
    transaction.type = type;

    transaction.amount = amount;
    transaction.createdAt = timestamp;

    transaction.save();
}