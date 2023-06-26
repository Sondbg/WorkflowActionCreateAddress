/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record'],
    /**
     * @param{log} log
     * @param{record} record
     */
    function (log, record) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            try {
                var fieldTrigger = scriptContext.fieldId;

                if (fieldTrigger != "parent") return

                var currRecord = scriptContext.currentRecord;

                var parent = currRecord.getValue({
                    fieldId: 'parent'
                });

                if (parent != 4018) return

                var sublistAdr = "addressbook";

                var parentRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: parent,
                    isDynamic: false
                });

                var addressSublistLength = parentRecord.getLineCount({
                    sublistId: sublistAdr
                });

                var defaultBillAddress;

                for (var line = 0; line < addressSublistLength; line++) {
                    if (parentRecord.getSublistValue({
                        sublistId: sublistAdr,
                        fieldId: "defaultbilling",
                        line: line
                    })) {
                        defaultBillAddress = parentRecord.getSublistSubrecord({
                            sublistId: sublistAdr,
                            fieldId: "addressbookaddress",
                            line: line
                        });
                        break;
                    }

                }
                log.debug({
                    title: 'retrieved Address',
                    details: defaultBillAddress
                })

                currRecord.selectNewLine({
                    sublistId: sublistAdr
                });

                var parentAdrLineRecord = currRecord.getCurrentSublistSubrecord({
                    sublistId: sublistAdr,
                    fieldId: "addressbookaddress"
                })

                var billFields = ['country', 'attention', 'addressee', 'addrphone', 'addr1', 'addr2', 'city', 'addr3', 'state', 'zip'];


                for (var index = 0; index < billFields.length; index++) {

                    var tempValue = defaultBillAddress.getValue({
                        fieldId: billFields[index]
                    });

                    parentAdrLineRecord.setValue({
                        fieldId: billFields[index],
                        value: tempValue
                    });

                    log.debug(billFields[index], tempValue)

                }

                currRecord.setCurrentSublistValue({
                    sublistId: sublistAdr,
                    fieldId: "defaultbilling",
                    value: true
                })

                currRecord.commitLine({
                    sublistId: sublistAdr,
                    ignoreRecalc: true
                })

                // currRecord.save()

            } catch (err) {
                log.error({
                    title: 'error creating address from parent',
                    details: err
                })
            }
        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        return {
            postSourcing: postSourcing,
        };

    });
