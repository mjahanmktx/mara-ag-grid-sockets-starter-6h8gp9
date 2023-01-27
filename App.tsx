import * as React from 'react';
import useWebsocket, { ReadyState } from 'react-use-websocket';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export default function App() {
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    { field: 'amount', sortable: true, filter: true },
    { field: 'price', sortable: true, filter: true },
    { field: 'timestamp', sortable: true, filter: true },
  ]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
    }),
    []
  );

  const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', event);
  }, []);

  const buttonListener = useCallback((e) => {
    gridRef.current.api.deselectAll();
  }, []);

  const subscribeMsg = {
    event: 'bts:subscribe',
    data: {
      channel: 'live_trades_btcusd',
    },
  };

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebsocket(
    'wss://ws.bitstamp.net',
    {
      onOpen: () => sendJsonMessage(subscribeMsg),
    }
  );

  // useEffect(() => {
  //   console.log('lastJsonMessage: ', lastJsonMessage);
  // }, [lastJsonMessage]);

  // useEffect(() => {
  //   console.log('lastJsonMessage: ', lastJsonMessage);
  //   if (lastJsonMessage != null && lastJsonMessage.event === 'trade') {
  //     lastJsonMessage.data.timestamp = new Date(
  //       lastJsonMessage.data.timestamp * 1000
  //     ).toLocaleString();
  //     setRowData((prev) => [...prev, {price: lastJsonMessage.time: lastJsonMessage.data}]);
  //   }
  // }, [lastJsonMessage]);

  useEffect(() => {
    console.log('lastJsonMessage: ', lastJsonMessage);
    if (lastJsonMessage != null && lastJsonMessage.event === 'trade') {
      lastJsonMessage.data.timestamp = new Date(
        lastJsonMessage.data.timestamp * 1000
      ).toLocaleString();
      setRowData((prev) => [...prev, lastJsonMessage.data]);
    }
  }, [lastJsonMessage]);

  return (
    <div className="ag-theme-alpine" style={{ height: 500 }}>
      <button onClick={buttonListener}>Clear Selections</button>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        animateRows={true}
        onCellClicked={cellClickedListener}
        ref={gridRef}
      />
    </div>
  );
}
