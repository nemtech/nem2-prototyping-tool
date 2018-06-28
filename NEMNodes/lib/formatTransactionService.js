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
    TransferTransaction, NetworkType } = require('nem2-sdk');

//const formatMosaics = require('../lib/formatMosaicService');
const {formatNetworkType} = require('../lib/utilityFormat');
const formatTransactions = function (transactions, host, network) {
    if (transactions instanceof Array) {
        transactions.map(transaction => {
            transaction = formatTransaction(transaction);
            transaction.signer.address = transaction.signer.address.pretty();
            transaction.transactionInfo.height = transaction.transactionInfo.height.compact();
        })
    }
    return transactions;
};
const formatTransaction = function (transaction) {
    transaction.deadline = transaction.deadline.value;
    transaction.fee = transaction.fee.compact();
    transaction.networkType = formatNetworkType(transaction.networkType);

    if (transaction instanceof TransferTransaction) {
        transaction.type = "TransferTransaction";
        transaction.recipient.address = transaction.recipient.pretty();
        if (transaction.mosaics.length > 0) {
        }
    } else if (transaction instanceof RegisterNamespaceTransaction) {
        transaction.type = "RegisterNamespaceTransaction";
        if (transaction.namespaceType === NamespaceType.RootNamespace && transaction.duration !== undefined) {
            transaction.duration = transaction.duration.compact();
        } else if (transaction.parentId !== undefined) {
            transaction.parentId = transaction.parentId.toHex();
        }
    } else if (transaction instanceof MosaicDefinitionTransaction) {
        transaction.type = "MosaicDefinitionTransaction";
        transaction.mosaicProperties.duration = transaction.mosaicProperties.duration.compact();
    } else if (transaction instanceof MosaicSupplyChangeTransaction) {
        transaction.type = "MosaicSupplyChangeTransaction";
        transaction.mosaicId = transaction.mosaicId.toHex();
        transaction.direction = (transaction.direction === MosaicSupplyType.Increase ?
            'DecreaseSupply' : 'IncreaseSupply');
        transaction.delta = transaction.delta.compact();
    } else if (transaction instanceof ModifyMultisigAccountTransaction) {
        transaction.type = "ModifyMultisigAccountTransaction";
        transaction.modifications.map((modification, index) => {
            transaction.modifications[index].type =
                (modification.type === MultisigCosignatoryModificationType.Add ? 'Add' : 'Remove');
            transaction.modifications[index].cosignatoryPublicAccount.address = modification.cosignatoryPublicAccount.address.pretty();
        });
    } else if (transaction instanceof AggregateTransaction) {
        transaction.type = "AggregateTransaction";
        transaction.cosignatures.map((cosignature, index) => {
            transaction.cosignatures[index].signer = cosignature.signer.address.pretty();
        });
        if (transaction.innerTransactions.length > 0) {
            transaction.innerTransactions = formatTransactions(transaction.innerTransactions);
        }
    } else if (transaction instanceof LockFundsTransaction) {
        transaction.type = "LockFundsTransaction";
        transaction.duration = transaction.duration.compact();
    } else if (transaction instanceof SecretLockTransaction) {
        transaction.type = "SecretLockTransaction";
        transaction.duration = transaction.duration.compact();
        transaction.hashType = (transaction.hashType === 0 ? 'SHA3_512' : transaction.hashType);
        transaction.recipient = transaction.recipient.pretty();
    } else if (transaction instanceof SecretProofTransaction) {
        transaction.type = "SecretProofTransaction";
        transaction.hashType = (transaction.hashType === 0 ? 'SHA3_512' : transaction.hashType);
    }
    return transaction;
}

module.exports = {
    formatTransaction: formatTransaction,
    formatTransactions: formatTransactions
}
