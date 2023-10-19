import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from '../config/config.json';

export const Signature = () =>{
    const {id} = useParams();
    console.log("Agreement ID :"+id);
    const serverHostUrl = config.serverUrl;

    const SignatureWidget = () =>{

        useEffect(() => {
            let timeoutId = setTimeout(() => {
                fetch(serverHostUrl + `/sign/signingUrl/${id}?frameParent=localhost`,{
                    mode:'cors',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    method:'GET'
                }).then((response)=>{
                  return response.json();
                }).then((data)=>{
                  let url = data.signingUrlSetInfos[0].signingUrls[0].esignUrl;
                  console.log("Got URL:" + JSON.stringify(url));
                  window.location.href=url;
                })
            }, 5000)
            return () => {
                clearTimeout(timeoutId);
            }
        }, []);
        
        return(
            <>

            </>
        )
    }

    return(
        <div className="AppForm">
            <InPersonSignatureDialog />
            <header className="App-header">
                <p>契約証の署名</p>
            </header>
            <SignatureWidget />
            <Link to={`/`}>トップページに戻る</Link>
        </div>
    )
}



const InPersonSignatureDialog = () =>{
    const [show, setShow] = useState(true);
    const navigate = useNavigate();

    const handleClose = () =>{
        setShow(false);
        navigate('/');
    };

    const handleShowSignaturePage = () =>{
        setShow(false);
    };

    return(
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          対面での署名
        </Modal.Header>
        <Modal.Body>
          ご契約者に画面をお渡し下さい。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleShowSignaturePage}>確認</Button>
        </Modal.Footer>
      </Modal>
    );
}