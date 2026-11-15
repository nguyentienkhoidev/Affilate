# MaxMind GeoLite2 Country Database

Place `GeoLite2-Country.mmdb` in this directory (`deploy/geoip/GeoLite2-Country.mmdb`) so Spring Boot (`GeoIpService`) automatically loads it into RAM for sub-millisecond country detection from client IP addresses.

## 1. Download Manually
1. Sign up for a free MaxMind GeoLite2 account: https://www.maxmind.com/en/geolite2/signup
2. Download **GeoLite2 Country** (`.mmdb` format) and extract `GeoLite2-Country.mmdb` into this folder.

## 2. Optional Auto-Update via Docker (`geoipupdate`)
You can run `maxmindinc/geoipupdate` alongside `docker-compose.site.yml` pointing its volume to `./deploy/geoip:/usr/share/GeoIP` with your `GEOIPUPDATE_ACCOUNT_ID` and `GEOIPUPDATE_LICENSE_KEY`. Spring Boot detects file modification timestamps and reloads the database automatically without a restart.
