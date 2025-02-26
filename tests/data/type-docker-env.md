## Action type

This is a Docker action using a `Dockerfile`.

| Attribute | Value |
|-----------|-------|
| image | `Dockerfile` |
| entrypoint | `/entrypoint.sh` |
| post-entrypoint | `/cleanup.sh` |
| args | `${{ inputs.greeting }}`, `foo`, `bar` |

The container will run with the following environment variables:

| Environment Key | Value |
|-----------------|-------|
| SOME_BAR | `bob` |
| SOME_FOO | `alice` |
