FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
ENV MAVEN_OPTS="-Djava.net.preferIPv4Stack=true"
RUN mvn dependency:go-offline -B -Djava.net.preferIPv4Stack=true
COPY src ./src
RUN mvn clean package -DskipTests -Djava.net.preferIPv4Stack=true

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p /var/www/heygoodly/uploads && chmod -R 777 /var/www/heygoodly/uploads
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]
