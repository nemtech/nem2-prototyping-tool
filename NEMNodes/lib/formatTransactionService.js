const { AggregateTransaction,
    LockFundsTransaction,
    ModifyMultisigAccountTransaction,
    MosaicDefinitionTransaction,
    MosaicSupplyChangeTransaction,
    MosaicSupplyType,
    MultisigCosignatoryModificationType,
    NamespaceType,
    RegisterNamespaceTransaction,
    SecretLockTransaction,
    SecretProofTransaction,
    TransferTransaction,
    Transaction } = require('nem2-sdk');

const formatMosaics = require('../lib/formatMosaicService');
const { from, of, merge } = require('rxjs');
const operators = require("rxjs/operators");
const mergeMap = operators.mergeMap;
const filter = operators.filter;
const map = operators.map;
const pipe = operators.pipe;
const toArray = operators.toArray;
const { formatNetworkType } = require('../lib/utilityFormat');

function formatTransferTransactions(transactions, host, network) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof TransferTransaction),
            map(transaction => {
                transaction.type = "TransferTransaction";
                transaction.recipient.address = transaction.recipient.pretty();
                transaction.message.type = (transaction.message.type === 0 ? 'PlainMessage' : transaction.message.type)
                return transaction;
            }),
            mergeMap(transaction => {
                const transactionWithMosaics = from(transaction.mosaics)
                    .pipe(
                        mergeMap(mosaic => formatMosaics.getMosaicsName(mosaic, host, network)),
                        toArray(),
                        map(mosaics => {
                            transaction.mosaics = mosaics;
                            return transaction;
                        })
                    );
                return transaction.mosaics.length > 0 ? transactionWithMosaics : of(transaction);
            })
        );
};

function formatRegisterNamespaceTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof RegisterNamespaceTransaction),
            map(transaction => {
                transaction.type = "RegisterNamespaceTransaction";
                transaction.fee = transaction.fee.compact();
                if (transaction.namespaceType === NamespaceType.RootNamespace && transaction.duration !== undefined) {
                    transaction.duration = transaction.duration.compact();
                } else if (transaction.parentId !== undefined) {
                    transaction.parentId = transaction.parentId.toHex();
                }
                transaction.namespaceType = transaction.namespaceType === NamespaceType.RootNamespace ? "RootNamespace" : "SubNamespace"
                return transaction;
            })
        );
}

function formatMosaicDefinitionTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof MosaicDefinitionTransaction),
            map(transaction => {
                transaction.type = "MosaicDefinitionTransaction";
                transaction.mosaicProperties.duration = transaction.mosaicProperties.duration.compact();
                return transaction;
            })
        );
}

function formatMosaicSupplyChangeTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof MosaicSupplyChangeTransaction),
            map(transaction => {
                transaction.type = "MosaicSupplyChangeTransaction";
                transaction.direction = (transaction.direction === MosaicSupplyType.Increase ?
                    'IncreaseSupply' : 'DecreaseSupply');
                transaction.delta = transaction.delta.compact();
                return transaction;
            })
        );
}

function formatModifyMultisigAccountTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof ModifyMultisigAccountTransaction),
            map(transaction => {
                transaction.type = "ModifyMultisigAccountTransaction";
                transaction.modifications.map((modification, index) => {
                    transaction.modifications[index].type =
                        (modification.type === MultisigCosignatoryModificationType.Add ? 'Add' : 'Remove');
                    transaction.modifications[index].cosignatoryPublicAccount.address = modification.cosignatoryPublicAccount.address.pretty();
                });
                return transaction;
            })
        );
}

function formatLockFundsTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof LockFundsTransaction),
            map(transaction => {
                transaction.type = "LockFundsTransaction";
                transaction.duration = transaction.duration.compact();
                return transaction;
            })
        );
}

function formatSecretLockTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof SecretLockTransaction),
            map(transaction => {
                transaction.type = "SecretLockTransaction";
                transaction.duration = transaction.duration.compact();
                transaction.hashType = (transaction.hashType === 0 ? 'SHA3_512' : transaction.hashType);
                transaction.recipient = transaction.recipient.pretty();
                return transaction;
            })
        );
}

function formatSecretProofTransactions(transactions) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof SecretProofTransaction),
            map(transaction => {
                transaction.type = "SecretProofTransaction";
                transaction.hashType = (transaction.hashType === 0 ? 'SHA3_512' : transaction.hashType);
                return transaction;
            })
        );
}

function formatAggregateTransactions(transactions, host, network) {
    return transactions
        .pipe(
            mergeMap(transaction => transaction),
            filter(transaction => transaction instanceof AggregateTransaction),
            map(transaction => {
                transaction.type = "AggregateTransaction";
                transaction.cosignatures.map((cosignature, index) => {
                    transaction.cosignatures[index].signer = cosignature.signer.address.pretty();
                });
                return transaction;
            }),
            mergeMap(transaction => {
                return formatTransactions(transaction.innerTransactions, host, network)
                    .pipe(
                        map(innerTransactions => {
                            transaction.innerTransactions = innerTransactions;
                            return transaction;
                        })
                    );
            })
        );
}

function formatTransactions(unformattedTransactions, host, network) {

    unformattedTransactions
        .map(transaction => {
            if (transaction instanceof Transaction) {
                transaction.networkType = formatNetworkType(transaction.networkType);
                if (transaction.transactionInfo) {
                    transaction.transactionInfo.height = transaction.transactionInfo.height.compact();
                }
                if (transaction.signer) {
                    transaction.signer.address = transaction.signer.address.pretty();
                }
                return transaction;
            }
        })
    const transactions = of(unformattedTransactions);

    return merge(
        formatTransferTransactions(transactions, host, network),
        formatMosaicDefinitionTransactions(transactions),
        formatMosaicSupplyChangeTransactions(transactions),
        formatLockFundsTransactions(transactions),
        formatModifyMultisigAccountTransactions(transactions),
        formatSecretLockTransactions(transactions),
        formatSecretProofTransactions(transactions),
        formatRegisterNamespaceTransactions(transactions),
        formatAggregateTransactions(transactions, host, network)
    ).pipe(
        toArray()
    );
}

module.exports = {
    formatTransactions: formatTransactions
}
