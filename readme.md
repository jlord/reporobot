# Repo Robot

_////// WIP WIP WIP WIP WIP ////// Work in Progress ////// WIP WIP WIP WIP WIP //////_

This is the source code for a Repo Robot that lives on a server and interacts with particular repos involved with [Git-it](http://www.github.com/jlord/git-it) a beginers adventure! for learning Git and GitHub (through a series of challenges, users learn the basics like commits, remotes, branches, forking, pushing, pulling and pull requests). It has a GitHub account too, @reporobot.

This brings fun times like **adding a collaborators**, **pulling changes** and **verifying pull requests** to the learning experience. 

### The Plan

There is a (still in development) repository used in the [Git-it](http://www.github.com/jlord/git-it) workshop. Workshopees will **fork** this repository and then:

1. an event is sent to server* via a webhook
2. the username of the workshoppe is extracted
3. the address of the forked repository is spliced together
4. via Git-it the workshoppee is instructed to add @reporobot as a collaborator
5. listen to @reporobot's email for collaborator notification
6. server has @reporobot push some arbitrary code to the fork
7. the workshoppee therefore neesd to **pull** in changes. lesson learned!

*Currently I have a [Digital Ocean droplet](https://www.digitalocean.com/community/articles/how-to-create-your-first-digitalocean-droplet-virtual-server) is running this code 

### Ideally

It would be lovely if I could get a push notification as a user when I (@reporobot) have been added as a collaborator. Right now GitHub sends an email, but I don't believe it is possible through the API. But I'll be looking into it.

### Additionally

The last challenge of [Git-it](http://www.github.com/jlord/git-it) requires workshopees to create a pull request against the parent repository of their fork. Repo Robot will also verify the completion of this challenge via the GitHub API. I haven't got to the building of this part yet.