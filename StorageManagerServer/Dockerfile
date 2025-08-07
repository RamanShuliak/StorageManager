FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY StorageManagerServer.sln ./

COPY StorageManagerServer.Api/StorageManagerServer.Api.csproj \
     StorageManagerServer.Api/
COPY StorageManagerServer.Dal/StorageManagerServer.Dal.csproj \
     StorageManagerServer.Dal/
COPY StorageManagerServer.Services/StorageManagerServer.Services.csproj \
     StorageManagerServer.Services/

RUN dotnet restore StorageManagerServer.Api/StorageManagerServer.Api.csproj

COPY . .

WORKDIR /src/StorageManagerServer.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:5010
EXPOSE 5010

ENTRYPOINT ["dotnet", "StorageManagerServer.Api.dll"]
    