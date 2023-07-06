/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/log', 'N/search'],
    /**
 * @param{log} log
 * @param{search} search
 */
    (log, search) => {
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
            var newRecord = scriptContext.newRecord;
            var entityID = newRecord.getValue({
                fieldId: 'entity'
            })

            var entityCategory = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: entityID,
                columns: 'category'
            });

            runSearchMatrix(entityCategory.category[0].value);

            function runSearchMatrix(category) {

                var pricingObj = {}

                var matrixSearchObj = search.create({
                    type: "customrecord_aqt_pricing_matrix",
                    filters:
                        [
                            ["custrecord_aqt_price_matrix_cat", "anyof", category]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_aqt_pricing_group", label: "Pricing Group" }),
                            search.createColumn({
                                name: "internalid",
                                join: "CUSTRECORD_AQT_PRICE_LEVEL",
                                label: "Internal ID"
                            })
                        ]
                });

                var resultSet = matrixSearchObj.run();

                resultSet.each.promise(function (result) {
                    var group = result.getValue(resultSet.columns[0]);

                    var level = result.getValue(resultSet.columns[1]);

                    pricingObj[group] = level

                    return true

                }).then(function (response) {
                    log.debug('Completed PricingObject', pricingObj);
                    setLinePrices(pricingObj, newRecord)

                }).catch(function (reason) {
                    log.error('Failed Search', reason)
                })

            }

            function setLinePrices(pricingObj, record) {

                var sublistCount = record.getLineCount({
                    sublistId: 'item'
                });

                for (var index = 0; index < sublistCount; index++) {

                    var itemID = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: index
                    });

                    var itemCategory = search.lookupFields({
                        type: search.Type.ITEM,
                        id: itemID,
                        columns: "pricinggroup"
                    });
                    log.debug('item Category',itemCategory)

                    if (!itemCategory.pricinggroup[0]) continue
                    record.selectLine({
                        sublistId: 'item',
                        line: index
                    })
                    log.debug('pricing group value',pricingObj[itemCategory.pricinggroup[0].value])
                    record.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: pricingObj[itemCategory.pricinggroup[0].value],
                        ignoreFieldChange: true
                    })
                    record.commitLine({
                        sublistId: 'item',
                        ignoreRecalc: false
                    })

                }
            }
            return true
        }

        return { onAction };
    });
