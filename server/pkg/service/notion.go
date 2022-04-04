package service

import (
	"encoding/base64"
	"fmt"
	"os"
)

type Notion struct {
	Token     string
	BasicAuth *struct {
		Username string
		Password string
	}
}

type NotionRequest[T any] struct {
	Notion Notion
	Method string
	URL    string
	Body   *map[string]interface{}
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

type NotionTokenResponse struct {
	AccessToken   string `json:"access_token"`
	TokenType     string `json:"token_type"`
	BotID         string `json:"bot_id"`
	WorkspaceName string `json:"workspace_name"`
	WorkspaceIcon string `json:"workspace_icon"`
	WorkspaceID   string `json:"workspace_id"`
	Owner         struct {
		OwnerType string `json:"type"`
		User      struct {
			Object       string `json:"object"`
			ID           string `json:"id"`
			Name         string `json:"name"`
			AvatarUrl    string `json:"avatar_url"`
			ResponseType string `json:"type"`
			Person       struct {
				Email string `json:"email"`
			} `json:"person"`
		} `json:"user"`
	} `json:"owner"`
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
		} `json:"annotations"`
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

func (n Notion) RequestToken(code string) (NotionTokenResponse, error) {
	body := map[string]interface{}{
		"grant_type":   "authorization_code",
		"redirect_uri": os.Getenv("NOTION_REDIRECT_URL"),
		"code":         code,
	}
	return NotionRequest[NotionTokenResponse]{
		Notion: n,
		Method: "POST",
		URL:    "https://api.notion.com/v1/oauth/token",
		Body:   &body,
	}.req()
}

func (n Notion) GetMe() (NotionMeResponse, error) {
	return NotionRequest[NotionMeResponse]{
		Notion: n,
		Method: "GET",
		URL:    "https://api.notion.com/v1/users/me",
	}.req()
}

func (n Notion) Search(query string) (NotionSeachResponse, error) {
	body := map[string]interface{}{
		"query": query,
		"sort": map[string]string{
			"direction": "descending",
			"timestamp": "last_edited_time",
		},
	}
	return NotionRequest[NotionSeachResponse]{
		Notion: n,
		Method: "POST",
		URL:    "https://api.notion.com/v1/search",
		Body:   &body,
	}.req()
}

func (n Notion) GetDatabase(id string) (NotionResultResponse, error) {
	return NotionRequest[NotionResultResponse]{
		Notion: n,
		Method: "GET",
		URL:    fmt.Sprintf("https://api.notion.com/v1/databases/%s", id),
	}.req()
}

func (n Notion) CreatePage(databaseID string, properties map[string]interface{}) (NotionResultResponse, error) {
	body := map[string]interface{}{
		"parent": map[string]string{
			"database_id": databaseID,
		},
		"properties": properties,
	}
	return NotionRequest[NotionResultResponse]{
		Notion: n,
		Method: "POST",
		URL:    "https://api.notion.com/v1/pages",
		Body:   &body,
	}.req()
}

func (r NotionRequest[T]) req() (T, error) {
	headers := map[string]string{
		"Notion-Version": "2022-02-22",
	}
	if r.Notion.Token != "" {
		headers["Authorization"] = "Bearer " + r.Notion.Token
	}
	if r.Notion.BasicAuth != nil {
		headers["Authorization"] = "Basic " + base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", r.Notion.BasicAuth.Username, r.Notion.BasicAuth.Password)))
	}
	var responseObject *T
	err := Req(r.Method, r.URL, r.Body, headers, &responseObject)
	return *responseObject, err
}
