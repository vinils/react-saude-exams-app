import React, { Component } from 'react';
import {TreeTable} from '@vinils/react-table'

const head = [
    {description: 'Name 1', name:'name1'}, 
    {description: 'Name 2', name:'name2'}, 
    {description: 'Name 3', name:'name3'}
]

const treeRow = {
    name1: 'root1',
    name2: 'aaaa',
    name3: 'bbbbb',
    childs: [{
        name1: 'nodeA',
        name2: 'aaaa',
        name3: 'bbbbb',
        childs: [{
            name1: 'nodeAA',
            name2: 'aaaa',
            name3: 'bbbbb',
            childs: []    
        }]},{
        name1: 'nodeB',
        name2: 'aaaa',
        name3: 'bbbbb',
        childs: []
        }
    ]
}

export default class TreeExample extends Component {
    render() {
        return (
            <TreeTable
              style={{border: "1px solid black"}}
              head={head}
              getChilds={(line) => line.childs}>
                {[treeRow]}
            </TreeTable>
        );
    }
}
