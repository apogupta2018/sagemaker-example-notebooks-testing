import codebuild = require("@aws-cdk/aws-codebuild");

export function createPullRequestBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
        version: "0.2",
        env: {
            variables: {
                INSTANCE_TYPE: "ml.m5.xlarge",
            },
        },
        phases: {
            pre_build: {
                commands: [
                    `PR_NUM=$(echo $CODEBUILD_SOURCE_VERSION | grep -o "[0-9]\\+")`,
                    `echo "Running notebooks for PR $PR_NUM"`,
                ],
            },
            build: {
                commands: ["run-pr-notebooks --pr $PR_NUM --instance $INSTANCE_TYPE"],
            },
        },
    });
}

export function createNotebookInstanceBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
        version: "0.2",
        env: {
            variables: {
                INSTANCE_TYPE: "ml.m5.xlarge",
                REGION: "us-west-2",
            },
        },
        phases: {
            pre_build: {
                commands: [
                    `PR_NUM=$(echo $CODEBUILD_SOURCE_VERSION | grep -o "[0-9]\\+")`,
                    `NOTEBOOKS="$(pr-notebook-filenames --pr $PR_NUM)"`,
                ],
            },
            build: {
                commands: [
                    `
                    if [ -z "$NOTEBOOKS" ]; then
                        echo "No notebooks to test in this pull request."
                    else
                        echo "Testing $NOTEBOOKS"
                        aws s3 cp s3://sagemaker-mead-cli/mead-nb-test.tar.gz mead-nb-test.tar.gz
                        tar -xzf mead-nb-test.tar.gz
                        export JAVA_HOME=$(get-java-home)
                        echo "set JAVA_HOME=$JAVA_HOME"
                        export SAGEMAKER_ROLE_ARN=$(aws iam list-roles --output text --query "Roles[?RoleName == 'SageMakerRole'].Arn")
                        echo "set SAGEMAKER_ROLE_ARN=$SAGEMAKER_ROLE_ARN"
                        ./runtime/bin/mead-run-nb-test --instance-type $INSTANCE_TYPE --region $REGION --notebook-instance-role-arn $SAGEMAKER_ROLE_ARN $NOTEBOOKS
                    fi
                    `,
                ],
            },
        },
    });
}

export function createPrimaryReleaseBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
            build: {
                commands: [`echo "TODO: implement notebook release build"`],
            },
        },
    });
}

export function createDeployBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
            build: {
                commands: [`echo "TODO: implement notebook deploy build"`],
            },
        },
    });
}
