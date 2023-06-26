/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/log', 'N/record'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record) => {
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {
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

                var billFields = defaultBillAddress.fields;

                log.debug('billFields',billFields);

                for (var fieldValue in billFields) {

                    log.debug(fieldValue,billFields[fieldValue]);

                    parentAdrLineRecord.setValue({
                        fieldId: fieldValue,
                        value: billFields[fieldValue]
                    })

                    log.debug(fieldValue,parentAdrLineRecord)

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

            } catch (err) {
                log.error({
                    title: 'error creating address from parent',
                    details: err
                })
            }
        }

        return { onAction };
    });
