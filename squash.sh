#!/bin/bash
# Set the sequence editor to replace 'pick' with 'squash' for the specific commit
# We use a simple sed command. 
# 3119e36 is the newer commit we want to squash into 20aa5be (the older one)
export GIT_SEQUENCE_EDITOR="sed -i 's/^pick 3119e36/squash 3119e36/'"

# Start the interactive rebase for the last 20 commits
git rebase -i HEAD~20
