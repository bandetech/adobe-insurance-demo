import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const SentContract = () =>{
    return(
        <div className="container">
            <header className="App-header">
                <p>契約証を発送しました。</p>
            </header>
            <Link to={`/`}>トップページに戻る</Link>
        </div>
    )
}

