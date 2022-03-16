package service

type Notion struct {
	Token string
}

type NotionMeResponse struct {
	Object       string `json:"object"`
	ID           string `json:"id"`
	Name         string `json:"name"`
	AvatarUrl    string `json:"avatar_url"`
	ResponseType string `json:"type"`
	Bot          struct {
		Owner struct {
			OwnerType string `json:"type"`
			Workspace bool   `json:"workspace"`
		} `json:"owner"`
	} `json:"bot"`
}

type NotionResultResponse struct {
	Object      string `json:"object"`
	ID          string `json:"id"`
	Cover       string `json:"cover"`
	Icon        string `json:"icon"`
	CreatedTime string `json:"created_time"`
	CreatedBy   struct {
		Object string `json:"object"`
		ID     string `json:"id"`
	} `json:"created_by"`
	LastEditedBy struct {
		Object string `json:"object"`
		ID     string `json:"id"`
	} `json:"last_edited_by"`
	LastEditedTime string `json:"last_edited_time"`
	Title          []struct {
		Type string `json:"type"`
		Text struct {
			Content string `json:"content"`
			Link    string `json:"link"`
		} `json:"text"`
		Annotations struct {
			Bold          bool   `json:"bold"`
			Italic        bool   `json:"italic"`
			Strikethrough bool   `json:"strikethrough"`
			Underline     bool   `json:"underline"`
			Code          bool   `json:"code"`
			Color         string `json:"color"`
		} `json:"annotaations"`
		PlainText string `json:"plain_text"`
		Href      string `json:"href"`
	} `json:"title"`
	Properties map[string]interface{} `json:"properties"`
	Parent     struct {
		Type   string `json:"type"`
		PageID string `json:"page_id"`
	} `json:"parent"`
	Archived bool   `json:"archived"`
	URL      string `json:"url"`
}

type NotionSeachResponse struct {
	Object     string                 `json:"object"`
	NextCursor string                 `json:"next_cursor"`
	HasMore    bool                   `json:"has_more"`
	Type       string                 `json:"type"`
	Results    []NotionResultResponse `json:"results"`
}

func (n Notion) req(method string, url string, body map[string]interface{}, responseObject interface{}) error {
	return Req(method, url, body, map[string]string{
		"Notion-Version": "2022-02-22",
		"Authorization":  "Bearer " + n.Token,
	}, responseObject)
}

func (n Notion) GetMe() (NotionMeResponse, error) {
	var responseObject NotionMeResponse
	err := n.req("GET", "https://api.notion.com/v1/users/me", nil, &responseObject)
	return responseObject, err
}

func (n Notion) Search(query string) (NotionSeachResponse, error) {
	var responseObject NotionSeachResponse
	body := map[string]interface{}{
		"query": query,
		"sort": map[string]string{
			"direction": "descending",
			"timestamp": "last_edited_time",
		},
	}
	err := n.req("POST", "https://api.notion.com/v1/search", body, &responseObject)
	return responseObject, err
}

func (n Notion) GetDatabase(id string) (NotionResultResponse, error) {
	var responseObject NotionResultResponse
	err := n.req("GET", "https://api.notion.com/v1/databases/"+id, nil, &responseObject)
	return responseObject, err
}

func (n Notion) CreatePage(databaseID string, properties map[string]interface{}) (NotionResultResponse, error) {
	var responseObject NotionResultResponse
	body := map[string]interface{}{
		"parent": map[string]string{
			"database_id": databaseID,
		},
		"properties": properties,
	}
	err := n.req("POST", "https://api.notion.com/v1/pages", body, &responseObject)
	return responseObject, err
}
