package service

func (n Notion) req(method string, url string, body map[string]interface{}, responseObject interface{}) error {
	return Req(method, url, body, map[string]string{
		"Notion-Version": "2022-02-22",
		"Authorization":  "Bearer " + n.Token,
	}, responseObject)
}

func (n Notion) GetMe() (MeResponse, error) {
	var responseObject MeResponse
	err := n.req("GET", "https://api.notion.com/v1/users/me", nil, &responseObject)
	return responseObject, err
}

func (n Notion) SearchPage(query string) (SeachResponse, error) {
	var responseObject SeachResponse
	body := map[string]interface{}{"query": query}
	err := n.req("POST", "https://api.notion.com/v1/search", body, &responseObject)
	return responseObject, err
}
