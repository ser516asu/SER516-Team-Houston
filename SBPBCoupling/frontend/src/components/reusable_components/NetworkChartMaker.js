import { React, useEffect, useState } from 'react';
import Loader from './Loader';
import Graph from 'react-graph-vis';
import { v4 as uuidv4 } from 'uuid';
import '../../App.css'

export default function NetworkChartMaker (props) {
    console.log("propsData", props.data);

    function convertKeys(data, type) {
        
        let nodes = [];
        let edges = [];
        
        if(type == "nodes") {
            data.map(obj => {
                let currentObj = {id: obj ? obj.id : 0, label:  obj ? (props.setNodeType + "#" + obj.label.toString()) : "None (Choose a sprint for data to populate)", title: obj ? obj.title.toString() : "Title Not available"}
                nodes.push(currentObj)
            }); 

            return nodes;
        }
        if(type == "edges") {
            data.map(obj => {
                console.log("obj", obj)
                let currentObj = {from: obj? obj.from : 0, to: obj ? obj.to : 0}
                nodes.push(currentObj)
            }); 

            return nodes;
        }
    }

    useEffect(() => {
        if (props.data) {
            props.setShowLoader(false);
        }
    }, [props.data])

    const graph = {
        nodes: props.data && props.data.nodes? convertKeys(props.data.nodes, "nodes") : [{id: 0, label: "Choose an option from the dropdown", title: "no title"}],
        edges: props.data && props.data.edges? convertKeys(props.data.edges, "edges") : [{from: 0, to: 0}]
    }

    console.log("graph", graph);

    const option = {
        height: "450px",
        edges: {
            color: "red"
        },
        nodes: {
            borderWidth: 2,
            size: 40,
            color: {
                border: "#000000",
            }
        },
    }

    return (
        <div className='graph-container'>
            {props && props.showLoader? 
                <Loader /> 
                : <div className='h-auto border-solid border-red-400 border-2 w-full rounded-xl'>
                    <Graph
                        graph={graph}
                        options={option}
                        key={uuidv4()}
                    />
                </div>
            }
        </div>
    );
}