FROM maven:3.9.9-eclipse-temurin-24-alpine@sha256:64f4ac33351e932d931bfe62cba7fcc320317a7d27c3154b6fb120111241efb2 AS base

FROM base AS test
WORKDIR /build

COPY ./src src/

RUN --mount=type=bind,source=pom.xml,target=pom.xml --mount=type=cache,target=/root/.m2 mvn test --batch-mode

FROM base AS deps
WORKDIR /build

RUN --mount=type=bind,source=pom.xml,target=pom.xml --mount=type=cache,target=/root/.m2 mvn dependency:go-offline --batch-mode -DskipTests

FROM deps AS package
WORKDIR /build

COPY ./src src/

RUN --mount=type=bind,source=pom.xml,target=pom.xml --mount=type=cache,target=/root/.m2 mvn package --batch-mode -DskipTests

FROM base AS jar

COPY --from=package /build/target/*.jar /t212.jar

ENTRYPOINT ["java", "-jar", "/t212.jar"]
