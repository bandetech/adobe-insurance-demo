import React from 'react';
import { useState, useContext } from "react";
import { PreviewPdf } from "./components/PreviewPdf";
import { Row, Col, Form, Button, Image } from 'react-bootstrap';
import { OrderFormContext } from './providers/OrderFormProvider';
import { DateRangePicker } from 'react-bootstrap-daterangepicker';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import config from './config/config.json';

const AppForm = ()=> {
  console.log("Called AppForm ....");
  const [msg, setMsg] = useState('NONE');
  const [check, setCheck] = useState(false);
  const {setOrderForm} = useContext(OrderFormContext);
  const [validated, setValidated] = useState(false);
  const [insurancePeriod, setInsurancePeriod] = useState();

  // set server and port
  const serverHostUrl = config.serverUrl;
  console.log("Server Host: " + serverHostUrl);

  const insuredNameRef = React.createRef();
  const policyHolderNameRef = React.createRef();
  
  const submitForm = (e)=>{
    const form = e.currentTarget;
    if(form.checkValidity() === false){
      console.log("Come invalid form!");
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);

      return;
    }

    e.preventDefault();
    setMsg('RENDERING');
    const formData = new FormData(document.getElementById('appForm'));

    if(insuredNameRef.current.value != null && check){
      formData.append("insuredName", insuredNameRef.current.value);
    }

    // 契約期間設定
    formData.append("periodOfInsuranceFrom", insurancePeriod.periodOfInsuranceFrom);
    formData.append("periodOfInsuranceTo", insurancePeriod.periodOfInsuranceTo);

    var obj={};
    formData.forEach((value, key)=>obj[key] = value);

    console.log(obj);
    setOrderForm(obj);
    
    fetch(serverHostUrl + '/createPdf',{
      method: 'POST',
      mode: 'cors',
      body: formData
    }).then((response) => {
      if(!response.ok){
        console.log(response);
        console.log('Error while calling /createPdf');
        setMsg('ERROR');
      }
      return response.json();
    }).then((data) => {
      setMsg(data);
      setOrderForm((orgData)=>({
        ...orgData,
        locationUrl: data.locationUrl,
        fileName: data.fileName
      }));

    }).catch((error) => {
      console.log(error);
    });


  }

  const onCheck = (e) =>{
    console.log("Checked!", e.target.checked);

    if(e.target.checked){
      insuredNameRef.current.value = policyHolderNameRef.current.value;
      setCheck(true);
    } else {
      setCheck(false);
      insuredNameRef.current.value = '';
    }

  }

  const handleCallback = (from, to) =>{
    setInsurancePeriod({periodOfInsuranceFrom: from.format('YYYY-MM-DD'), periodOfInsuranceTo: to.format('YYYY-MM-DD')});
    console.log(insurancePeriod);
  }

  return (
    <div className="AppForm">
      <header className="App-header">
        <Image src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGcgaWQ9IlN1cmZhY2VzIj48cGF0aCBmaWxsPSIjYjMwYjAwIiBkPSJNNC4yNS4zaDE1LjVBNC4yNDY0Myw0LjI0NjQzLDAsMCwxLDI0LDQuNTV2MTQuOWE0LjI0NjQzLDQuMjQ2NDMsMCwwLDEtNC4yNSw0LjI1SDQuMjVBNC4yNDY0Myw0LjI0NjQzLDAsMCwxLDAsMTkuNDVWNC41NUE0LjI0NjQzLDQuMjQ2NDMsMCwwLDEsNC4yNS4zWiIvPjwvZz48ZyBpZD0iT3V0bGluZWRfTW5lbW9uaWNzX0xvZ29zIiBkYXRhLW5hbWU9Ik91dGxpbmVkIE1uZW1vbmljcyBMb2dvcyI+PHBhdGggaWQ9Il8yNTYiIGRhdGEtbmFtZT0iIDI1NiIgZmlsbD0iI2ZmZiIgZD0iTTE5LjMsMTMuODVhMS43ODk0NiwxLjc4OTQ2LDAsMCwwLS40NDAzMS0uMzM1NDcsMi44MzgyOCwyLjgzODI4LDAsMCwwLS41OTk2OS0uMjQwNzgsNC43OTc4OCw0Ljc5Nzg4LDAsMCwwLS43NTcxOS0uMTQ1MTZBNy45NDMzMiw3Ljk0MzMyLDAsMCwwLDE2LjU5LDEzLjA4cS0uMjczNzUuMDAzNzUtLjU0ODkxLjAxNy0uMjc0OTIuMDEzMzctLjU0OTg0LjAzNjcyLS4yNzQ3LjAyMzQ1LS41NDguMDU3MzQtLjI3My4wMzQtLjU0MzI4LjA3ODkxLS4xNzI1LS4xNjg3NS0uMzM4OTEtLjM0NS0uMTY2MTctLjE3NjI1LS4zMjQ4NC0uMzYtLjE1ODQ0LS4xODM3NS0uMzA4LS4zNzUtLjE0OTMtLjE5MTI1LS4yODgyOC0uMzktLjEwODc1LS4xNDYyNS0uMjEyLS4yOTYyNS0uMTAzMzctLjE1LS4yMDE3Mi0uMzAzNzUtLjA5ODQ1LS4xNTM3NS0uMTkyMzQtLjMxMTI1LS4wOTQtLjE1NzUtLjE4MzkxLS4zMTg3NS4xNzYyNS0uNTUxMjUuMzA3NjYtMS4wNDgxMy4xMzE0OC0uNDk2ODguMjE4NTktLjkzOTM3LjA4NzE4LS40NDI1LjEzMDQ3LS44MzA2M0E2LjUyOTA4LDYuNTI5MDgsMCwwLDAsMTMuMDUsNy4wM2EzLjY3NSwzLjY3NSwwLDAsMC0uMDg1OTQtLjgwNTYzQTIuNDIzNzMsMi40MjM3MywwLDAsMCwxMi42ODUsNS41MDVhMS40OTI3LDEuNDkyNywwLDAsMC0uNTA0MDYtLjUxNjg4QTEuNDQ5NTksMS40NDk1OSwwLDAsMCwxMS40Miw0Ljc5YTEuMTk3MjgsMS4xOTcyOCwwLDAsMC0uMzA1NDcuMDQ3MTlBMS4yMjA1NywxLjIyMDU3LDAsMCwwLDEwLjQxLDUuMzhhMi4xNzgzOSwyLjE3ODM5LDAsMCwwLS4yNTA3OC44MjE4Nyw0LjY5ODgxLDQuNjk4ODEsMCwwLDAsLjAwNywxLjA4ODEzLDcuODU0NjYsNy44NTQ2NiwwLDAsMCwuMjU2NDEsMS4yNjgxMkExMC4yNjE0NiwxMC4yNjE0NiwwLDAsMCwxMC45Miw5LjkyYy0uMDcyNS4yMTI1LS4xNDYyNS40MjMxMi0uMjIyLjYzMzkxcy0uMTUzNi40MjE3MS0uMjM0MjIuNjM0ODQtLjE2NDA2LjQyODQ0LS4yNTEwOS42NDhTMTAuMDM1LDEyLjI4LDkuOTQsMTIuNTFxLS4xMjM3NS4yOTI1LS4yNTM0NC41ODI4MVE5LjU1NjcyLDEzLjM4Myw5LjQyLDEzLjY3cS0uMTM2ODguMjg2ODgtLjI4MTU2LjU2OTY5UTguOTkzNTksMTQuNTIyMzUsOC44NCwxNC44Yy0uMzA3NS4xMjI1LS43MDEyNS4yODkzNy0xLjEyMjgxLjQ5MTU2QTEyLjk5NDQ0LDEyLjk5NDQ0LDAsMCwwLDYuNDI3NSwxNS45OTVhNi4wODYxOCw2LjA4NjE4LDAsMCwwLTEuMTA1OTQuODYwOTRBMS45NjczLDEuOTY3MywwLDAsMCw0Ljc1LDE3LjgyYTEuMDg2MjQsMS4wODYyNCwwLDAsMC0uMDE5NjkuMjkyMTksMS4xMDM2NiwxLjEwMzY2LDAsMCwwLC4wNTcxOS4yODI4MSwxLjEzOTMyLDEuMTM5MzIsMCwwLDAsLjEyODQ0LjI2MDMxQTEuMTc4MTIsMS4xNzgxMiwwLDAsMCw1LjExLDE4Ljg4YTEuNDU1NDMsMS40NTU0MywwLDAsMCwuMjMzMTIuMTcwNDcsMS40OTI3MiwxLjQ5MjcyLDAsMCwwLC4yNTkzOC4xMjA3OCwxLjU0OTYsMS41NDk2LDAsMCwwLC4yNzgxMi4wNzAxNkExLjYwODE1LDEuNjA4MTUsMCwwLDAsNi4xNywxOS4yNmEyLjI2Njg0LDIuMjY2ODQsMCwwLDAsMS4xNjk1My0uMzY5ODQsNS40MDMsNS40MDMsMCwwLDAsMS4xMjE3Mi0uOTUzOTEsMTEuNTU5MTIsMTEuNTU5MTIsMCwwLDAsMS4wMjYwOS0xLjMwNDUzYy4zMjA3OC0uNDY3MzQuNjE3NjYtLjk1NDIyLjg4MjY2LTEuNDIxNzJxLjIyNS0uMDc1LjQ1MTcyLS4xNDc4MS4yMjY2NC0uMDcyNjYuNDU0NTMtLjE0MjE5LjIyNzgxLS4wNjkzOC40NTY0MS0uMTM0NjkuMjI4NTEtLjA2NTE1LjQ1NzM0LS4xMjUzMS4yNTEyNS0uMDY3NS40OTY4Ny0uMTI3NjYuMjQ1NjItLjA2MDIyLjQ4NTYzLS4xMTM1OS4yNC0uMDUzNDMuNDc0MzctLjEwMDQ3LjIzNDM4LS4wNDcxLjQ2MzEzLS4wODgyOGE3Ljg3Mzg5LDcuODczODksMCwwLDAsMS4yMDI2Ni44NzI2Niw2LjI2OTI0LDYuMjY5MjQsMCwwLDAsMS4wODM1OS41MDYwOSw1LjI1NCw1LjI1NCwwLDAsMCwuOTEzLjIzNDIyQTQuMzc2NDksNC4zNzY0OSwwLDAsMCwxOCwxNS45YTIuNTkzNjgsMi41OTM2OCwwLDAsMCwuNjUxMjUtLjA3NDUzQTEuNTEwMzEsMS41MTAzMSwwLDAsMCwxOS4xLDE1LjYzMzc1YTEuMTI3NywxLjEyNzcsMCwwLDAsLjI4Mzc1LS4yNjEwOUExLjExMzI1LDEuMTEzMjUsMCwwLDAsMTkuNTQsMTUuMDlhMS4yMjUyMSwxLjIyNTIxLDAsMCwwLC4wNjgtLjMyMzEzLDEuMjU1ODcsMS4yNTU4NywwLDAsMC0uMTIyODEtLjYzODc1QTEuMjM3OTEsMS4yMzc5MSwwLDAsMCwxOS4zLDEzLjg1Wm0tMS4wOS43NmEuNTE1NC41MTU0LDAsMCwxLS4wODY0MS4xOTczNC41ODQ4OS41ODQ4OSwwLDAsMS0uMTYyMzQuMTUxNDEuNzk0ODEuNzk0ODEsMCwwLDEtLjIyOC4wOTdBMS4xMjQ4LDEuMTI0OCwwLDAsMSwxNy40NSwxNS4wOWMtLjAzLDAtLjA1OTM3LS4wMDA2Mi0uMDg4MjgtLjAwMnMtLjA1NzM0LS4wMDM1OS0uMDg1NDctLjAwNjcyLS4wNTU5NC0uMDA3MTktLjA4MzU5LS4wMTIzNFMxNy4xMzc1LDE1LjA1NzUsMTcuMTEsMTUuMDVhNC45NTU4OSw0Ljk1NTg5LDAsMCwxLS41NTcxOS0uMTY5MDYsNS4yNjUzOCw1LjI2NTM4LDAsMCwxLS41NDc4MS0uMjM4NDQsNS44ODcxNiw1Ljg4NzE2LDAsMCwxLS41NDAzMS0uMzA5NjlxLS4yNjg1OS0uMTczLS41MzQ2OS0uMzgyODEuMTk4NzUtLjAzLjM5OTM4LS4wNTI1dC40MDMxMi0uMDM3NXEuMjAyNS0uMDE1LjQwNjg4LS4wMjI1VDE2LjU1LDEzLjgzcS4xMzUtLjAwMzc1LjI3LS4wMDAxNS4xMzUuMDAzNTEuMjcuMDEzOS4xMzUuMDEwMzIuMjcuMDI3LjEzNS4wMTY2NS4yNy4wMzkyMmExLjA2NTU3LDEuMDY1NTcsMCwwLDEsLjIzNDA2LjA2NDM4LjY3NTkyLjY3NTkyLDAsMCwxLC4yMDU5NC4xMjgxMi40NzE1MS40NzE1MSwwLDAsMSwuMTMwOTQuMjA2ODhBLjYxNTM2LjYxNTM2LDAsMCwxLDE4LjIxLDE0LjYxWk0xMS4wNSw1Ljc2YS40NDY2OS40NDY2OSwwLDAsMSwuMDYzMTItLjA4OTIyLjQxOC40MTgsMCwwLDEsLjA4MTg4LS4wNjk1My4zODU2My4zODU2MywwLDAsMSwuMDk2ODctLjA0NTE2QS4zNzAzMy4zNzAzMywwLDAsMSwxMS40LDUuNTRhLjM1ODUuMzU4NSwwLDAsMSwuMjMyMTkuMDc3ODEuNDk0MzEuNDk0MzEsMCwwLDEsLjE0MDMxLjE5OTY5LDEuMTE0MjEsMS4xMTQyMSwwLDAsMSwuMDY5MDYuMjcwOTRBMi4xMzkwOCwyLjEzOTA4LDAsMCwxLDExLjg2LDYuMzhhNC43NTI2OSw0Ljc1MjY5LDAsMCwxLS4wMzMxMy41MjI2NmMtLjAyMTg3LjE5NDUzLS4wNTQzNy40MDgtLjA5Njg3LjYzNjA5cy0uMDk1LjQ3MDk0LS4xNTY4OC43MjQyMlMxMS40NCw4Ljc4LDExLjM2LDkuMDVhOC41NzQ5Miw4LjU3NDkyLDAsMCwxLS4zNDY1Ni0xLjE3MzU5LDUuOTY0MTgsNS45NjQxOCwwLDAsMS0uMTMwOTQtLjk1NTE2LDMuNTA0NjksMy41MDQ2OSwwLDAsMSwuMDMwMzEtLjcxMzI4QTEuMzgyMjYsMS4zODIyNiwwLDAsMSwxMS4wNSw1Ljc2Wm0uOTEsOC4wM3EtLjEyMzc1LjAzMzc1LS4yNDc1LjA2NzY2LS4xMjM3NS4wMzQtLjI0NzUuMDY4NTktLjEyMzc1LjAzNDY4LS4yNDc1LjA3MDQ3LS4xMjM3NS4wMzU4NS0uMjQ3NS4wNzMyOC4wNjc1LS4xMzUuMTMxMjUtLjI2ODEzdC4xMjM3NS0uMjY0MzdxLjA2LS4xMzEyNS4xMTYyNS0uMjYwNjNUMTEuNDUsMTMuMDJxLjA2NzUtLjE2ODc1LjEzNDY5LS4zMzU3OC4wNjctLjE2NzExLjEzMjgxLS4zMzMuMDY1NjMtLjE2NTk1LjEyOTA2LS4zMzEwOS4wNjMyOS0uMTY1MjQuMTIzNDQtLjMzMDE2LjA1MjUuMDgyNS4xMDUxNi4xNjMyOC4wNTI3Mi4wODA4Ny4xMDYwOS4xNjA0Ny4wNTM0My4wNzk2OC4xMDguMTU4NTkuMDU0Ni4wNzkuMTEwNzguMTU3NjYuMTA4NzUuMTUuMjE5NjkuMjk2MjUuMTExMDkuMTQ2MjUuMjI1MzEuMjg4NzUuMTE0MzguMTQyNS4yMzI4MS4yODEyNS4xMTg1OS4xMzg3NS4yNDIxOS4yNzM3NWExLjI4NDc0LDEuMjg0NzQsMCwwLDAtLjE0OTIyLjAyODkxYy0uMDkyMzQuMDIwMTUtLjIyMDE2LjA0OTIyLS4zNjIuMDgyMzRzLS4yOTc4MS4wNzAzMS0uNDQ2NDEuMTA2NzJTMTIuMDcyNSwxMy43NiwxMS45NiwxMy43OVptLTMuNTEsMmMtLjI1MjUuNDA1LS41MDM3NS43NzI1LS43NDc2NiwxLjA5NTk0YTguNzA5MDcsOC43MDkwNywwLDAsMS0uNzAzNTkuODMxNTYsMy42MywzLjYzLDAsMCwxLS42MjMuNTI3ODFBLjk5MDQxLjk5MDQxLDAsMCwxLDUuODcsMTguNDNhLjQzMDk0LjQzMDk0LDAsMCwxLS4wNjg3NS0uMDA1NjMuNDQxMi40NDEyLDAsMCwxLS4wNjg3NS0uMDE2ODcuNDAwNC40MDA0LDAsMCwxLS4wNjUtLjAyODEzQS4zMzQxOS4zMzQxOSwwLDAsMSw1LjYxLDE4LjM0YS4zODQuMzg0LDAsMCwxLS4wNzA5NC0uMDc2MDkuMzY5ODIuMzY5ODIsMCwwLDEtLjA2Njg3LS4xODk2OUEuMzgwODQuMzgwODQsMCwwLDEsNS40OCwxNy45N2ExLjExNzA4LDEuMTE3MDgsMCwwLDEsLjI3NDIyLS40Nzg0NCwzLjg0NzM5LDMuODQ3MzksMCwwLDEsLjYxNDUzLS41NDQwNiw4Ljc0MzU5LDguNzQzNTksMCwwLDEsLjkxMjY2LS41Nzc4MUM3LjYzMDYzLDE2LjE3NSw4LjAyMjUsMTUuOTgsOC40NSwxNS43OVoiLz48L2c+PC9zdmc+" alt="Document Cloud Icon" focusable="false" aria-hidden="true" role="img" className="spectrum-icon"></Image>
         <div className="pageTitle">アドビ旅行保険 申込フォーム</div>
      </header>
      <div>
        <Form noValidate validated={validated} id="appForm" onSubmit={submitForm}>
          <Form.Group className="mb-2" controlId="formPolicyHolderName">
            <Form.Label>保険契約者</Form.Label>
            <Form.Control type="text" name="policyHolderName" ref={policyHolderNameRef} required/>
            <Form.Control.Feedback type="invalid">保険契約者名を入力してください</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="formInsuredName">
            <Form.Label>被保険者氏名</Form.Label><Form.Check type="checkbox" id="sameAsPolicyHolder" label="保険契約者に同じ" onChange={onCheck}  />            
            <Form.Control type="text" name="insuredName" required disabled={check} ref={insuredNameRef} />
            <Form.Control.Feedback type="invalid">被保険者氏名を入力してください</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-2" controlId="formInsuredEmail">
            <Form.Label>E-Mail</Form.Label>
            <Form.Control type="text" name="insuredEmail" required/>
            <Form.Control.Feedback type="invalid">E-Mailを入力してください</Form.Control.Feedback>            
          </Form.Group>  
          <Form.Group className="mb-2" controlId="formInsuredBirthDate">
            <Row>
            <Col>
              <Form.Label>生年月日</Form.Label>
              <Form.Control type="date" name="insuredBirthDate"/>   
            </Col>
            <Col>
              <Form.Label>性別</Form.Label>
              <Form.Select name="insuredSex">
                <option>選択してください</option>
                <option value="男">男</option><option value="女">女</option>
              </Form.Select>
            </Col>         
            </Row>
          </Form.Group>  

          <Form.Group className="mb-2" controlId="formPurposeOfTrip">
            <Row>
              <Col>
                <Form.Label>旅行目的</Form.Label>
                  <Form.Select name="purposeOfTrip">
                    <option value="観光">観光</option><option value="ビジネス">ビジネス</option>
                  </Form.Select>
              </Col>
              <Col>
                <Form.Label>旅行先</Form.Label>
                <Form.Select name="destination">
                  <option value="アメリカ">アメリカ</option>
                  <option value="カナダ">カナダ</option>
                  <option value="イギリス">イギリス</option>
                  <option value="ヨーロッパ">ヨーロッパ</option>
                  <option value="ロシア">ロシア</option>
                  <option value="中国">中国</option>
                  <option value="台湾">台湾</option>
                  <option value="オーストラリア">オーストラリア</option>
                  <option value="ブルネイ">ブルネイ</option>            
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="mb-2" controlId="formInsuranceTypeAndPeriod">
            <Row>
              <Col>
                <Form.Label>保険タイプ</Form.Label>
                <Form.Select name="insuranceType">
                  <option value="ベーシックタイプ">ベーシックタイプ</option>
                  <option value="アドバンスタイプ">アドバンスタイプ</option>
                  <option value="プレミアタイプ">プレミアタイプ</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>旅行期間</Form.Label>
                <DateRangePicker initialSettings={{ showDropdowns: true, locale: {format: 'YYYY/MM/DD'}}} onCallback={handleCallback}>
                  <input type="text" className="form-control col-4" />
                </DateRangePicker>
              </Col>
            </Row>
          </Form.Group>
          <Button variant="primary" type="submit" className="button">送信</Button>
        </Form>
        
      </div>
        <div className="pdfArea">
          <PreviewPdf genStatus={msg}/>
        </div>
    </div>
  );
};

export {AppForm};