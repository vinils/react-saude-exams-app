import React, { Component } from 'react';
import Table from '@vinils/react-table'

const matrix = [
  ['texttext', 'texttext', 'texttext'],
  ['texttext', 'texttext', 'texttext'],
  ['texttext', 'texttext', 'texttext'],
  ['texttext', 'texttext', 'texttext'],
]

export default class MatrixExample extends Component {
    render() {
        return (
            <Table style={{border: "1px solid black"}}>
                {matrix}
            </Table>
        );
    }
}
