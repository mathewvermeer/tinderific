package util

import play.api.libs.json.Json
import play.api.libs.ws.WS

/**
 * User: Mathew
 * Date: 22/4/2014
 * Time: 9:23 PM
 */
class TinderRequest(private var authToken: String) {

  def this() {
    this("")
  }

  private val baseUri = "https://api.gotinder.com/"

  def auth(facebookToken: String) = {
    post("auth", Map("facebook_token" -> facebookToken))
  }

  def get(target: String) = {
    require(authToken != null)
    WS.url(baseUri + target).withHeaders(headers.toSeq:_*).get()
  }

  def post(target: String, data: Map[String, String], num: Boolean = false) = {
    require(authToken != null)

    if (num) {
      val map = data.mapValues((v) => java.lang.Double.parseDouble(v))
      val json = Json.toJson(map)
      WS.url(baseUri + target).withHeaders(headers:_*).post(json)
    } else {
      val json = Json.toJson(data)
      WS.url(baseUri + target).withHeaders(headers:_*).post(json)
    }
  }

  private val headers = Seq(
    "X-Auth-Token" -> authToken,
    "Content-Type" -> "application/json; charset=utf-8",
    "User-Agent" -> "Tinder Android Version 3.2.0,",
    "app_version" -> "757",
    "platform" -> "android",
    "os_version" -> "19",
    "Host" -> "api.gotinder.com",
    "Connection" -> "Keep-Alive",
    "If-None-Match" -> "1908628478",
    "Accept-Enconding" -> "gzip"
  )

}
