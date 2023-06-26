/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            try {


                var currRecord = scriptContext.newRecord;

                var parent = currRecord.getValue({
                    fieldId: 'parent'
                });

                if (!parent) return

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

                for (var fieldValue of billFields) {

                    var tempValue = defaultBillAddress.getValue({
                        fieldId: fieldValue
                    });

                    parentAdrLineRecord.setValue({
                        fieldId: fieldValue,
                        value: tempValue
                    });

                    log.debug(fieldValue,tempValue)

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
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
