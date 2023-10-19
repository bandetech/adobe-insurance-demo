import React from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useState, useContext, useRef, createRef, useLayoutEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { OrderFormContext } from '../providers/OrderFormProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from '../config/config.json';

const PreviewPdf = (prop) =>{
    console.log("Called RenderForm ....");
    const [show, setShow] = useState(false);
    const signatureMethod = useRef("EMAIL");
    const handleClose = () => setShow(false);
    const {orderForm} = useContext(OrderFormContext);
    const navigate = useNavigate();

    const creatingPdfRef = createRef();

    const serverHostUrl = config.serverUrl;
    const redirectUrl = config.redirectUrl;

    useLayoutEffect(()=>{
      if(creatingPdfRef && creatingPdfRef.current){
        creatingPdfRef.current.scrollIntoView();
      }
    }, [creatingPdfRef]);

    const commonHeaders = {
      method:'POST',
      mode:'cors',
      headers:{
        'Content-Type': 'application/json'
      }
    }
    
    // Email Signature Handler
    const sendSignature = () =>{
      fetch(serverHostUrl + '/sign/transientDocument',{
        ...commonHeaders,
        body: JSON.stringify({locationUrl:orderForm.locationUrl, fileName:orderForm.fileName})
      }).then((response) =>{
        if(!response.ok){
          console.log('Error while calling /transientDocumebnt :'+response);
        }
        return response.json();
      }).then((data)=>{
          console.log("Got TransientId :"+data);
          fetch(serverHostUrl + '/sign/sendSignature',{
            ...commonHeaders,
            body: JSON.stringify({
              transientDocumentId: data.transientDocumentId,
              name: orderForm.policyHolderName,
              title: '海外保険申込書',
              isEmailEnabled: true,
              email: orderForm.insuredEmail
            })
          }).then((response)=>{
            return response.json();
          }).then((data)=>{
            navigate('/sent');
          });
      });
    }

    // In-person signature
    const inPersonSignature = () =>{
      fetch(serverHostUrl + '/sign/transientDocument',{
        ...commonHeaders,
        body: JSON.stringify({locationUrl:orderForm.locationUrl, fileName:orderForm.fileName})
      }).then((response) =>{
        if(!response.ok){
          console.log('Error while calling /transientDocumebnt :'+response);
        }
        return response.json();
      }).then((data)=>{
          console.log("Got TransientId :"+data);
          fetch(serverHostUrl + '/sign/sendSignature',{
            ...commonHeaders,
            body: JSON.stringify({
              transientDocumentId: data.transientDocumentId,
              name: orderForm.policyHolderName,
              title: '海外保険申込書',
              email: orderForm.insuredEmail,
              isEmailEnabled: false,
              redirectUrl: redirectUrl
            })
          }).then((response)=>{
            return response.json();
          }).then((data)=>{
            console.log("Completed Sending signature: "+data.id);
            navigate(`/signature/${data.id}`);
            }) 
          });
      }
    

    const handleSignature = () => {
      setShow(false);
      console.log(orderForm);
      console.log("Signature Method :"+signatureMethod);
      if(signatureMethod.current === "EMAIL"){
        console.log("E-Mail Signature called");
        sendSignature();
      } else {
        console.log("In Person Signature called");
        inPersonSignature();
      }
    }

    const handleCheckSignatureMethod = () =>{
      console.log("handleCheckSignature was called!");
      setShow(true);
    }

    const loadPDF = () => {
      console.log("loadPDF was called!");
      new Promise((resolve)=>{
        if(window.AdobeDC){
          resolve();
        } else {
          document.addEventListener("adobe_dc_view_sdk.ready", ()=>{
            resolve();
          });
        }
      }).then(()=>{
        const fullUrl = serverHostUrl +  genStatus['locationUrl'];
        const adobeDCView = new window.AdobeDC.View({clientId: config.embedClientId, divId: "adobe-dc-view", locale: "ja-JP"});
        adobeDCView.previewFile({
          content: {location: {url: fullUrl}},
          metaData: {fileName: genStatus['fileName']}
        }, {
          embedMode: "IN_LINE",
          defaultViewMode: "FIT_WIDTH",
          showPageControls: true
        });
      })
    }; 
  
    const {genStatus} = prop;
    console.log(prop);
    switch(genStatus){
      case 'RENDERING':
        return(
          <div className="creatingPdf" ref={creatingPdfRef}>
            <Spinner animation="border" variant="primary" className="inline-block"/>
            <div className="inline-block">契約証を作成しています...</div>
          </div>
        )
      case 'ERROR':
        return(
          <div>GOT ERROR!</div>
        )
      case 'NONE':
        return(
          <div></div>
        )
      default:
        loadPDF();
        return(
          <>
            <div id="adobe-dc-view"></div>
            <Button variant="primary" onClick={handleCheckSignatureMethod} className="button">署名へ...</Button>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                署名の方法
              </Modal.Header>
              <Modal.Body>
                以下から署名の方法を選択下さい。
                <Form>
                  <Form.Check type="radio" name="signatureSelection" id="byEmail" label="E-Mailで送付して署名" defaultChecked onClick={()=>signatureMethod.current="EMAIL"}></Form.Check>
                  <Form.Check type="radio" name="signatureSelection" id="byInPerson" label="対面で署名" onClick={()=>signatureMethod.current="IN_PERSON"}></Form.Check>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSignature}>署名</Button>
              </Modal.Footer>
            </Modal>
          </>
        )
    }
  };

  export {PreviewPdf};