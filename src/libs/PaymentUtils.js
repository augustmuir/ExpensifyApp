import _ from 'underscore';
import lodashGet from 'lodash/get';
import BankAccount from './models/BankAccount';
import * as Expensicons from '../components/Icon/Expensicons';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';
import * as Localize from './Localize';

/**
 * Check to see if user has either a debit card or personal bank account added
 *
 * @param {Array} [cardList]
 * @param {Array} [bankAccountList]
 * @returns {Boolean}
 */
function hasExpensifyPaymentMethod(cardList = [], bankAccountList = []) {
    const validBankAccount = _.some(bankAccountList, (bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });

    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    const validDebitCard = _.some(cardList, card => lodashGet(card, 'additionalData.isP2PDebitCard', false));

    return validBankAccount || validDebitCard;
}

/**
 * Get the PaymentMethods list
 * @param {Array} bankAccountList
 * @param {Array} cardList
 * @param {Object} personalBankAccount
 * @param {String} [payPalMeUsername='']
 * @param {Object} userWallet
 * @returns {Array<PaymentMethod>}
 */
function formatPaymentMethods(bankAccountList, cardList, personalBankAccount = {}, payPalMeUsername = '', userWallet) {
    const combinedPaymentMethods = [];

    const pendingBankAccount = lodashGet(this.props.personalBankAccount, 'pendingFields.selectedBankAccount', {});
    // See if we need to show a pending bank account in the payment methods list
    if (!_.isEmpty(pendingBankAccount)) {
        const formattedBankAccountNumber = pendingBankAccount.accountNumber
            ? `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${pendingBankAccount.accountNumber.slice(-4)
            }`
            : null;
        const {icon, iconSize} = getBankIcon(lodashGet(pendingBankAccount, 'additionalData.bankName', ''));
        combinedPaymentMethods.push({
            title: pendingBankAccount.addressName,
            description: formattedBankAccountNumber,
            methodID: 0,
            icon,
            iconSize,
            key: 'bankAccount-0',
            accountType: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
            accountData: _.extend({}, pendingBankAccount, {icon}),
            isDefault: false,
            isPending: true,
            errors: pendingBankAccount.errors,
            pendingAction: pendingBankAccount.pendingAction,
        });
    }

    _.each(bankAccountList, (bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }

        const formattedBankAccountNumber = bankAccount.accountNumber
            ? `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${bankAccount.accountNumber.slice(-4)
            }`
            : null;
        const isDefault = userWallet.walletLinkedAccountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT && userWallet.walletLinkedAccountID === bankAccount.bankAccountID;
        const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'additionalData.bankName', ''));
        combinedPaymentMethods.push({
            title: bankAccount.addressName,
            description: formattedBankAccountNumber,
            methodID: bankAccount.bankAccountID,
            icon,
            iconSize,
            key: `bankAccount-${bankAccount.bankAccountID}`,
            accountType: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
            accountData: _.extend({}, bankAccount, {icon}),
            isDefault,
            errors: bankAccount.errors,
            pendingAction: bankAccount.pendingAction,
        });
    });

    _.each(cardList, (card) => {
        const formattedCardNumber = card.cardNumber
            ? `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
            : null;
        const isDefault = userWallet.walletLinkedAccountType === CONST.PAYMENT_METHODS.DEBIT_CARD && userWallet.walletLinkedAccountID === card.fundID;
        const {icon, iconSize} = getBankIcon(card.bank, true);
        combinedPaymentMethods.push({
            title: card.addressName,
            description: formattedCardNumber,
            methodID: card.fundID,
            icon,
            iconSize,
            key: `card-${card.cardNumber}`,
            accountType: CONST.PAYMENT_METHODS.DEBIT_CARD,
            accountData: _.extend({}, card, {icon}),
            isDefault,
            errors: card.errors,
            pendingAction: card.pendingAction,
        });
    });

    if (payPalMeUsername) {
        combinedPaymentMethods.push({
            title: 'PayPal.me',
            methodID: CONST.PAYMENT_METHODS.PAYPAL,
            description: payPalMeUsername,
            icon: Expensicons.PayPal,
            key: 'payPalMePaymentMethod',
            accountType: CONST.PAYMENT_METHODS.PAYPAL,
            accountData: {
                username: payPalMeUsername,
                icon: Expensicons.PayPal,
            },
        });
    }

    return combinedPaymentMethods;
}

/**
 * @param {Number} currentBalance, in cents
 * @param {String} methodType
 * @returns {Number} the fee, in cents
 */
function calculateWalletTransferBalanceFee(currentBalance, methodType) {
    const transferMethodTypeFeeStructure = methodType === CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT
        ? CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT
        : CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.ACH;
    const calculateFee = Math.ceil(currentBalance * (transferMethodTypeFeeStructure.RATE / 100));
    return Math.max(calculateFee, transferMethodTypeFeeStructure.MINIMUM_FEE);
}

function maskFinancialNumber(type, number) {
    let maskedFormat = '';

    if (type === 'bankAccount') {
        maskedFormat = Localize.translateLocal('paymentMethodList.accountLastFour');
    } else if (type === 'card') {
        maskedFormat = Localize.translateLocal('paymentMethodList.cardLastFour');
    } else {
        return null;
    }

    return `${maskedFormat} ${number.slice(-4)}`;
}

export {
    calculateWalletTransferBalanceFee,
    formatPaymentMethods,
    hasExpensifyPaymentMethod,
    maskFinancialNumber,
};
