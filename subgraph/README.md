# Subgraph

A subgraph defines which data `The Graph` will index from Ethereum, and how it will store it. Once deployed, it will form a part of a global graph of blockchain data. Read more about The Graph [here](https://thegraph.com/docs/developer/quick-start). For Velas subgraph follow [Velas subgraph setup](#) section.

## Setup

Execute all the following commands from the subgraph folder.

```bash
yarn install
```

### Development

Re-generate files after making changes

```bash
yarn codegen
```

### Deployment

1. ```bash
   yarn build
   ```
1. Set the Graph access token in your terminal.
    ```bash
    GRAPH_TOKEN={place_token_here}
    ```
1. ```bash
   yarn deploy
   ```
1. Query data in the [Graph Playground](https://thegraph.com/legacy-explorer/subgraph/amplify-labs/amplify-stage)

## Velas subgraph setup

1. Set a self-hosted [Graph Node](https://github.com/graphprotocol/graph-node) for Velas network, docs TBD
2. Create subgraph `amplify-labs/subgraph-velas` on the graph node by: `graph create --node http://graph-node.ampt.tech:8020/ amplify-labs/subgraph-velas`
3. Deploy to graph node by: `yarn deploy:velastest`
