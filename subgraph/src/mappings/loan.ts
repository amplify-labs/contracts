import { dataSource, BigInt } from '@graphprotocol/graph-ts';

import { LoanCreated } from '../../generated/Factory/FactoryAbi';
import { Repayed, Borrowed, Closed } from '../../generated/templates/Loan/LoanAbi';
import { Loan } from '../../generated/schema';

export function createNewLoan(event: LoanCreated): void {
    let loan = new Loan(event.params.loan.toHex());

    loan.amount = event.params.amount;
    loan.debt = new BigInt(0);
    loan.factor = event.params.factor;
    loan.asset = event.params.tokenId.toHex()
    loan.pool = event.params.pool.toHex();
    loan.isClosed = false;

    loan.save();
}

export function handleLoanRepay(event: Repayed): void {
    let context = dataSource.context();
    let loan = Loan.load(context.getBytes("loan").toHex());

    if (loan) {
        loan.debt = loan.debt.minus(event.params.amount);
    }

    loan.save();
}

export function handleLoanBorrow(event: Borrowed): void {
    let context = dataSource.context();
    let loan = Loan.load(context.getBytes("loan").toHex());

    if (loan) {
        loan.debt = event.params.amount;
    }

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