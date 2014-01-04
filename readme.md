# Repo Robot

_////// WIP WIP WIP WIP WIP ////// Work in Progress ////// WIP WIP WIP WIP WIP //////_

This is the source code for a Repo Robot that lives on a server and interacts with particular repos involved with [Git-it](http://www.github.com/jlord/git-it) a beginers adventure! for learning Git and GitHub (through a series of challenges, users learn the basics like commits, remotes, branches, forking, pushing, pulling and pull requests). It has a GitHub account too, @reporobot.

This brings fun times like **adding a collaborators**, **pulling changes** and **verifying pull requests** to the learning experience.

### The Plan

There is a (still in development) repository used in the [Git-it](http://www.github.com/jlord/git-it) workshop. Workshopees will **fork** this repository and then:

1. in Git-it the workshoppee is instructed to add @reporobot as a collaborator
2. push to server** when @reporobot gets an 'added you to repo' email
3. server has @reporobot push some arbitrary code to the fork
4. the workshoppee therefore needs to **pull** in changes. lesson learned!

*A [Digital Ocean Droplet](https://www.digitalocean.com/community/articles/how-to-create-your-first-digitalocean-droplet-virtual-server) is running this code

**Using a [cloudmailin](www.cloudmailin.com) webhook

### Additionally

The last challenge of [Git-it](http://www.github.com/jlord/git-it) requires workshopees to create a pull request against the parent repository of their fork. Repo Robot will also verify the completion of this challenge via the GitHub API. I haven't got to the building of this part yet.
