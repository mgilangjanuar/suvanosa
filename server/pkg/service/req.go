package service

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
)

func Req(method string, url string, body map[string]interface{}, headers map[string]string, responseObject interface{}) error {
	var req *http.Request

	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		request, err := http.NewRequest(method, url, bytes.NewBuffer(data))
		if err != nil {
			return err
		}
		req = request
		req.Header.Add("Content-Type", "application/json")
	} else {
		request, err := http.NewRequest(method, url, nil)
		if err != nil {
			return err
		}
		req = request
	}

	for k, v := range headers {
		req.Header.Add(k, v)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(bodyBytes, &responseObject); err != nil {
		return err
	}

	return nil
}
