import React from 'react';
import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

export const Signed = () =>{

    return(
        <div className="AppForm">
            <header className="App-header">
                <p className="signFinishedTitle">署名完了</p>
            </header>
            <div className="signedFinishedContent">
            署名が完了しました。契約証はメールでお送りいたします。
            <Link to="/">トップページに戻る</Link>
            </div>
        </div>
    )
}