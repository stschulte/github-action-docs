## Action type

This is a NodeJS action and depends on node20

| Attribute | Value |
|-----------|-------|
| using | `node20` |
| main | `dist/index.js` |

## Inputs

| Name | Description | Default | Required |
|------|-------------|---------|:--------:|
| <a name="input_bucket"></a> [bucket](#input\_bucket) | The name of the S3 bucket that contains the ZIP file |  | yes |
| <a name="input_key"></a> [key](#input\_key) | The name of the S3 key of the ZIP file |  | yes |
| <a name="input_directories"></a> [directories](#input\_directories) | A multiline string that specifies which directories should be copied to your target directory. Each line should be of the form `source=destination` |  | no |
| <a name="input_fail_on_not_found"></a> [fail\_on\_not\_found](#input\_fail\_on\_not\_found) | Specify true if you want the action to fail when a file cannot be found. Otherwise missing files will be ignored | `false` | no |
| <a name="input_files"></a> [files](#input\_files) | A multiline string that specifies which files should be copied to your target directory. Each line should be of the form `source=destination` |  | no |
| <a name="input_source_base_directory"></a> [source\_base\_directory](#input\_source\_base\_directory) | The base directory for the source path. If you do not specify a value, all paths are relative the the zip extraction | `.` | no |
| <a name="input_target_base_directory"></a> [target\_base\_directory](#input\_target\_base\_directory) | The base directory for your target paths. If you do not specify a value, all paths are relative to your project directory | `.` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_time"></a> [time](#output\_time) | Your output description here |
