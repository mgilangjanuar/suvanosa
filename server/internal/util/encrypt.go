package util

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

func Encrypt(s string) (*string, error) {
	key, err := hex.DecodeString(os.Getenv("SECRET_KEY"))
	if err != nil {
		return nil, err
	}

	plaintext := []byte(s)

	block, err := aes.NewCipher(key)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	result := fmt.Sprintf("%x", ciphertext)

	return &result, nil
}

func Decrypt(encryptedString string) (*string, error) {
	key, _ := hex.DecodeString(os.Getenv("SECRET_KEY"))
	enc, _ := hex.DecodeString(encryptedString)

	fmt.Println(key, enc, os.Getenv("SECRET_KEY"), encryptedString)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesGCM.NonceSize()

	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	result := string(plaintext)
	return &result, nil
}
