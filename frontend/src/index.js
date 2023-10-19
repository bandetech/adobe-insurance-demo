import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppForm } from './App';
import { OrderFormProvider } from './providers/OrderFormProvider';
import { SentContract } from './components/SentContract';
import { Signature } from './components/Signature'
import { Signed} from './components/Signed';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


ReactDOM.render(
  <React.StrictMode>
    <OrderFormProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppForm />} />
          <Route path="/sent" element={<SentContract />} />
          <Route path="/signature/:id" element={<Signature />} />
          <Route path="/signed" element={<Signed />} />
        </Routes>
      </BrowserRouter>
    </OrderFormProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
