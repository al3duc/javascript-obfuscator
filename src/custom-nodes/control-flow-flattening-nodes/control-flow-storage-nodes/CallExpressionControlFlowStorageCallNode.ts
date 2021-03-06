import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../../container/ServiceIdentifiers';

import type * as ESTree from 'estree';

import { TIdentifierNamesGeneratorFactory } from '../../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TStatement } from '../../../types/node/TStatement';

import { IOptions } from '../../../interfaces/options/IOptions';
import { IRandomGenerator } from "../../../interfaces/utils/IRandomGenerator";
import { ICustomNodeFormatter } from '../../../interfaces/custom-nodes/ICustomNodeFormatter';

import { initializable } from '../../../decorators/Initializable';

import { AbstractCustomNode } from '../../AbstractCustomNode';
import { NodeFactory } from '../../../node/NodeFactory';
import { NodeUtils } from '../../../node/NodeUtils';

@injectable()
export class CallExpressionControlFlowStorageCallNode extends AbstractCustomNode {
    /**
     * @type {Expression}
     */
    @initializable()
    private callee!: ESTree.Expression;

    /**
     * @type {string}
     */
    @initializable()
    private controlFlowStorageKey!: string;

    /**
     * @type {string}
     */
    @initializable()
    private controlFlowStorageName!: string;

    /**
     * @type {(ESTree.Expression | ESTree.SpreadElement)[]}
     */
    @initializable()
    private expressionArguments!: (ESTree.Expression | ESTree.SpreadElement)[];

    /**
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {ICustomNodeFormatter} customNodeFormatter
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.ICustomNodeFormatter) customNodeFormatter: ICustomNodeFormatter,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(identifierNamesGeneratorFactory, customNodeFormatter, randomGenerator, options);
    }

    /**
     * @param {string} controlFlowStorageName
     * @param {string} controlFlowStorageKey
     * @param {Expression} callee
     * @param {(Expression | SpreadElement)[]} expressionArguments
     */
    public initialize (
        controlFlowStorageName: string,
        controlFlowStorageKey: string,
        callee: ESTree.Expression,
        expressionArguments: (ESTree.Expression | ESTree.SpreadElement)[]
    ): void {
        this.controlFlowStorageName = controlFlowStorageName;
        this.controlFlowStorageKey = controlFlowStorageKey;
        this.callee = callee;
        this.expressionArguments = expressionArguments;
    }

    protected getNodeStructure (): TStatement[] {
        const structure: TStatement = NodeFactory.expressionStatementNode(
            NodeFactory.callExpressionNode(
                NodeFactory.memberExpressionNode(
                    NodeFactory.identifierNode(this.controlFlowStorageName),
                    NodeFactory.identifierNode(this.controlFlowStorageKey)
                ),
                [
                    this.callee,
                    ...this.expressionArguments
                ]
            )
        );

        NodeUtils.parentizeAst(structure);

        return [structure];
    }
}
