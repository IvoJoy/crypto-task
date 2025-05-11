FROM maven:3.9.9-eclipse-temurin-24-alpine@sha256:64f4ac33351e932d931bfe62cba7fcc320317a7d27c3154b6fb120111241efb2 AS base

FROM base AS test
WORKDIR /build

COPY . ./

RUN --mount=type=cache,target=/root/.m2 \
  mvn test --batch-mode

FROM base AS deps
WORKDIR /build

COPY api/pom.xml api/pom.xml
COPY ingest/pom.xml ingest/pom.xml
COPY common/pom.xml common/pom.xml
COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
  mvn dependency:go-offline --batch-mode -DskipTests

FROM deps AS package
WORKDIR /build

COPY . ./

RUN --mount=type=cache,target=/root/.m2 \
  mvn package --batch-mode -DskipTests

FROM base AS ingest

COPY --from=package /build/ingest/target/*.jar /ingest-service.jar

ENTRYPOINT ["java", "-jar", "/ingest-service.jar"]

FROM base AS api

COPY --from=package /build/api/target/*.jar /api.jar

ENTRYPOINT ["java", "-jar", "/api.jar"]
