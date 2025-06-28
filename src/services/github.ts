import { Octokit } from "octokit";
import fs from "fs";
import { execa } from "execa";

class GitHubService {
  private readonly octokit: Octokit;
  private readonly owner: string;

  constructor(token: string, owner: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.owner = owner;
  }

  public async cloneWholeRepository(
    repositoryName: string,
    targetFolderPath: string
  ) {
    const branches = await this.getBranches(repositoryName);

    if (branches.length > 0) {
      for (const branch of branches) {
        this.checkoutDevTo(
          repositoryName,
          branch.name,
          `${targetFolderPath}/${branch.name}`
        );
      }
    }
  }

  public async checkoutTo(
    repositoryName: string,
    branchName: string,
    targetFolderPath: string,
    open = false
  ) {
    const repo = await this.getRepository(repositoryName);
    const branch = await this.getBranch(repo.name, branchName);
    this.checkout(repo, branch.name, targetFolderPath, false, open);
  }

  public async checkoutDevTo(
    repositoryName: string,
    branchName: string,
    targetFolderPath: string,
    open = false
  ) {
    const repo = await this.getRepository(repositoryName);
    const branch = await this.getBranch(repo.name, branchName);
    this.checkout(repo, branch.name, targetFolderPath, true, open);
  }

  public async getRepositories(): Promise<any[]> {
    const response = await this.execute("GET", `/orgs/{org}/repos`, {
      org: this.owner,
    });
    return response.data;
  }

  public async getRepository(name: string): Promise<any> {
    const response = await this.execute("GET", `/repos/{owner}/{repo}`, {
      owner: this.owner,
      repo: name,
    });
    return response.data;
  }

  public async getBranches(repository: string): Promise<any> {
    const response = await this.execute(
      "GET",
      `/repos/{owner}/{repo}/branches`,
      {
        owner: this.owner,
        repo: repository,
      }
    );
    return response.data;
  }

  public async cloneRepository(repository: any, targetFolderPath: string) {
    const childProcess = require("child_process");
    childProcess.exec(
      `git clone ${repository.clone_url} ${targetFolderPath}`,
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(error);
        } else {
          console.log(stdout);
        }
      }
    );
  }

  public async getBranch(repository: string, name: string): Promise<any> {
    const response = await this.execute(
      "GET",
      `/repos/{owner}/{repo}/branches/{branch}`,
      {
        owner: this.owner,
        repo: repository,
        branch: name,
      }
    );
    return response.data;
  }

  public async deleteBranch(
    repositoryName: any,
    branchName: string,
    repoTargetPath: string,
    deleteFolder = false
  ) {
    await this.deleteTargetBranch(repositoryName, branchName);

    if (deleteFolder) {
      const fs = require("fs");
      fs.rmdirSync(`${repoTargetPath}/${branchName}`, {
        recursive: true,
      });
      console.log(`Deleted folder ${branchName}`);
    }
  }
  public async createRepository(
    name: string,
    description: string,
    privateRepo: boolean = false,
    visibility: string = "public",
    license: string = "mit"
  ): Promise<any> {
    const { data } = await this.execute("POST", `/orgs/{org}/repos`, {
      org: this.owner,
      name,
      description,
      private: privateRepo,
      visibility,
      license,
    });

    this.createInitialCommit(data.name);

    return data;
  }

  public async createBranch(
    name: string,
    repository: string,
    base: string
  ): Promise<any> {
    const baseBranchResponse = await this.execute(
      "GET",
      `/repos/{owner}/{repo}/git/refs/heads/{branch}`,
      {
        owner: this.owner,
        repo: repository,
        branch: base,
      }
    );
    const baseSha = baseBranchResponse.data.object.sha;

    const response = await this.execute(
      "POST",
      `/repos/{owner}/{repo}/git/refs`,
      {
        owner: this.owner,
        repo: repository,
        ref: `refs/heads/${name}`,
        sha: baseSha,
      }
    );
    return response;
  }

  public async initializeBranch(
    repositoryName: string,
    branchName: string,
    targetFolderPath: string,
    base: string
  ): Promise<any> {
    const repo = await this.getRepository(repositoryName);
    const branch = await this.createBranch(branchName, repo.name, base);

    await this.initGitRepository(targetFolderPath, repo, branch);
    await this.configureRemoteRepository(targetFolderPath, repo.name);
    await this.fetchRepository(targetFolderPath);
    await this.checkoutBranch(targetFolderPath, branchName);
    await this.addFilesToGit(targetFolderPath);
    await this.commitAllFiles(targetFolderPath);
    await this.pushAllFiles(targetFolderPath, branchName);
  }

  private async checkoutBranch(targetFolderPath: string, branchName: string) {
    try {
      const result = await execa(
        "git",
        ["checkout", "-t", `origin/${branchName}`],
        { cwd: targetFolderPath }
      );
      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async fetchRepository(targetFolderPath: string) {
    try {
      const result = await execa("git", ["fetch", "origin"], {
        cwd: targetFolderPath,
      });
      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async configureRemoteRepository(
    targetFolderPath: string,
    repoName: string
  ) {
    try {
      const result = await execa(
        "git",
        [
          "remote",
          "add",
          "origin",
          `https://github.com/${this.owner}/${repoName}.git`,
        ],
        { cwd: targetFolderPath }
      );
      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async initGitRepository(
    targetFolderPath: string,
    repo: any,
    branch: any
  ) {
    try {
      const result = await execa("git", ["init"], { cwd: targetFolderPath });
      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async addFilesToGit(targetFolderPath: string) {
    try {
      const result = await execa("git", ["add", "."], {
        cwd: targetFolderPath,
      });
      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async pushAllFiles(targetFolderPath: string, branchName: string) {
    try {
      const result = await execa("git", ["push", "-u", "origin", branchName], {
        cwd: targetFolderPath,
      });

      console.log(result.stdout);
    } catch (error) {
      console.error(error);
    }
  }

  private async commitAllFiles(targetFolderPath: string) {
    try {
      await execa("git", ["commit", "-m", "Project Added To Branch"], {
        cwd: targetFolderPath,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async deleteTargetBranch(repositoryName: string, branchName: string) {
    const repo = await this.getRepository(repositoryName);
    const url = `/repos/${repo.owner.login}/${repo.name}/git/refs/heads/${branchName}`;

    await this.execute("DELETE", url, {});
  }

  private async checkout(
    repo: any,
    branch: string,
    targetFolderPath: string,
    dev = false,
    open = false
  ) {
    const childProcess = require("child_process");
    const repoUrl = repo.clone_url;

    // if (fs.existsSync(targetFolderPath)) {
    //   fs.rmdirSync(targetFolderPath, { recursive: true });
    //   console.log(`Deleted existing directory ${targetFolderPath}`);
    // }

    childProcess.exec(
      `git clone ${repoUrl} ${targetFolderPath}`,
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(error);
        } else {
          console.log(stdout);
          childProcess.exec(
            `git checkout ${branch}`,
            { cwd: targetFolderPath },
            (error: any, stdout: any, stderr: any) => {
              if (error) {
                console.error(error);
              } else {
                console.log(stdout);
                if (!dev) {
                  fs.rmdirSync(`${targetFolderPath}/.git`, { recursive: true });
                  console.log("Deleted .git directory");
                }

                if (open) {
                  this.openInCode(targetFolderPath);
                }
              }
            }
          );
        }
      }
    );
  }

  private openInCode(targetFolderPath: string) {
    const { exec } = require("child_process");
    exec(`code ${targetFolderPath}`, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(error);
      }
    });
  }

  private async createInitialCommit(
    repository: string,
    message: string = "Initial commit",
    filename: string = "README.md",
    content: string = "## Welcome to the repository!"
  ): Promise<any> {
    try {
      const branches = await this.getBranches(repository);

      if (branches.length === 0) {
        console.log(
          `Repository '${repository}' is empty. Using Contents API for initial commit.`
        );
        return await this.createFileViaContentsApi(
          repository,
          filename,
          content,
          message
        );
      } else {
        console.log(
          `Repository '${repository}' already has branches. Skipping initial commit via Contents API.`
        );
        throw new Error(
          `Repository '${repository}' is not empty. Cannot create an initial commit.`
        );
      }
    } catch (error: any) {
      if (error.status === 404 || error.response?.status === 404) {
        console.log(
          `Repository '${repository}' not found or uninitialized. Using Contents API for initial commit.`
        );
        return await this.createFileViaContentsApi(
          repository,
          filename,
          content,
          message
        );
      }
      throw error;
    }
  }

  private async createFileViaContentsApi(
    repository: string,
    path: string,
    content: string,
    message: string
  ): Promise<any> {
    const base64Content = Buffer.from(content).toString("base64");

    const { data } = await this.execute(
      "PUT",
      `/repos/{owner}/{repo}/contents/{path}`,
      {
        owner: this.owner,
        repo: repository,
        path: path,
        message: message,
        content: base64Content,
      }
    );
    return data;
  }

  private async execute(type: string, url: string, config: any): Promise<any> {
    config["headers"] = {
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const response = await this.octokit.request(`${type} ${url}`, config);
    return response;
  }
}

export default GitHubService;
