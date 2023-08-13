package util

import play.api.libs.ws.WS

/**
  * Created by Mathew on 15/2/2016.
  */
class FacebookRequest(private var authToken: String) {

  def this() {
    this("")
  }

  private val baseUri = "https://graph.facebook.com/"

  def get(target: String) = {
    require(authToken != null)
    WS.url(s"$baseUri$target/?access_token=$authToken").get()
  }

}
