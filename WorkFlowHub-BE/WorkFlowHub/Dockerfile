# Stage 1: Build file .jar bằng Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Tải dependencies trước để tận dụng cache
RUN mvn dependency:go-offline -B
COPY src ./src
# Build bỏ qua test để tăng tốc deploy
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng bằng JRE nhẹ (Alpine)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo user thường để tăng tính bảo mật
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

# Cổng mặc định
EXPOSE 8080

# Cấu hình giới hạn RAM: Render Free chỉ có 512MB, giới hạn JVM Max Heap ở 350MB để tránh OOM
ENTRYPOINT ["java", "-Xmx350m", "-Xms200m", "-Dspring.profiles.active=dev", "-jar", "app.jar"]
