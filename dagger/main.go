package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"dagger.io/dagger"
)

type BlogCLI struct{}

// getGitCommit returns the current git commit hash
func getGitCommit() string {
	cmd := exec.Command("git", "rev-parse", "--short", "HEAD")
	output, err := cmd.Output()
	if err != nil {
		return "unknown"
	}
	return strings.TrimSpace(string(output))
}

// Build and push container with auto-update tag
func (m *BlogCLI) BuildAndPush(ctx context.Context) (string, error) {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return "", err
	}
	defer client.Close()

	// Build container
	container := client.Container().
		From("ubuntu:22.04").
		WithExec([]string{"apt-get", "update"}).
		WithExec([]string{"apt-get", "install", "-y", "nodejs", "npm", "git", "curl"}).
		WithExec([]string{"npm", "install", "-g", "@jackwener/opencli"}).
		WithDirectory("/app", client.Host().Directory(".")).
		WithWorkdir("/app").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npm", "link"})

	// Push with both latest and commit tags
	commitHash := getGitCommit()
	registry := "docker.io/yourusername/blog-cli"

	// Push with commit tag for versioning
	_, err = container.Publish(ctx, fmt.Sprintf("%s:%s", registry, commitHash))
	if err != nil {
		return "", fmt.Errorf("failed to publish commit tag: %w", err)
	}

	// Push as latest (Watchtower watches this)
	imageRef, err := container.Publish(ctx, fmt.Sprintf("%s:latest", registry))
	if err != nil {
		return "", fmt.Errorf("failed to publish latest tag: %w", err)
	}

	return imageRef, nil
}

// Test container functionality
func (m *BlogCLI) TestContainer(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return err
	}
	defer client.Close()

	container := client.Container().
		From("docker.io/yourusername/blog-cli:latest").
		WithExec([]string{"blog", "--version"}).
		WithExec([]string{"opencli", "--version"})

	_, err = container.Sync(ctx)
	return err
}

// Build local container for testing
func (m *BlogCLI) BuildLocal(ctx context.Context) (*dagger.Container, error) {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	container := client.Container().
		From("ubuntu:22.04").
		WithExec([]string{"apt-get", "update"}).
		WithExec([]string{"apt-get", "install", "-y", "nodejs", "npm", "git", "curl"}).
		WithExec([]string{"npm", "install", "-g", "@jackwener/opencli"}).
		WithDirectory("/app", client.Host().Directory(".")).
		WithWorkdir("/app").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npm", "link"}).
		WithExposedPort(8080)

	return container, nil
}

// Run tests in container
func (m *BlogCLI) RunTests(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return err
	}
	defer client.Close()

	container := client.Container().
		From("ubuntu:22.04").
		WithExec([]string{"apt-get", "update"}).
		WithExec([]string{"apt-get", "install", "-y", "nodejs", "npm"}).
		WithDirectory("/app", client.Host().Directory(".")).
		WithWorkdir("/app").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npm", "test"})

	_, err = container.Sync(ctx)
	return err
}