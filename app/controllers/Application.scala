package controllers

import _root_.util.{FacebookRequest, Login, TinderRequest}
import com.gargoylesoftware.htmlunit._
import com.gargoylesoftware.htmlunit.html._
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

object Application extends Controller {

  val loginForm = Form(
    mapping(
      "user" -> play.api.data.Forms.text,
      "pass" -> play.api.data.Forms.text
    )(Login.apply)(Login.unapply)
  )

  def enterCredentials() = Action { implicit request =>
    session.get("oauth").map {
      oauth => Redirect(routes.Application.index())
    }.getOrElse {
      Ok(views.html.login(loginForm))
    }
  }

  def index() = Action { implicit request =>
    val oauth = session.get("oauth").getOrElse {
      "invalid"
    }

    if (oauth == "invalid") {
      Redirect(routes.Application.enterCredentials())
    } else {
      val httpRequest = new TinderRequest().auth(oauth).map {
        response => {
          println(response.body)
          val token = (Json.parse(response.body) \ "token").as[String]
          Ok(views.html.index()).withSession(session + ("tt" -> token))
        }
      }

      Await.result(httpRequest, 5 seconds)
    }
  }

  def nope(id: String) = Action { implicit request =>
    AsyncResult {
      val token = session.get("tt").get
      new TinderRequest(token).get("pass/" + id).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def updates(token: String) = Action { implicit request =>
    AsyncResult {
      new TinderRequest(token).post("updates/", Map("last_activity_date" -> (System.currentTimeMillis / 1000).toString)).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def nearby() = Action { implicit request =>
    AsyncResult {
      val token = session.get("tt").get
      new TinderRequest(token).get("user/recs").map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def facebook(id: String) = Action { implicit request =>
    AsyncResult {
      val token = session.get("oauth").get
      new FacebookRequest(token).get(id).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def userinfo(id: String) = Action { implicit request =>
    AsyncResult {
      val token = session.get("tt").get
      new TinderRequest(token).get("user/" + id).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def profile() = Action { implicit request =>
    AsyncResult {
      val token = session.get("tt").get
      new TinderRequest(token).get("profile").map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def message(id: String, message: String) = Action { implicit request =>
    AsyncResult {
      new TinderRequest().post("user/matches/" + id, Map("message" -> message)).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def login() = Action { implicit request =>
    loginForm.bindFromRequest.fold(
      error => {
        BadRequest("Bad request")
      },
      data => {
        val user = data.user
        val pass = data.pass
        var webClient: WebClient = null
        var response: WebResponse = null
        var asdf = ""
        try {
          val browserVersion = new BrowserVersion.BrowserVersionBuilder(BrowserVersion.BEST_SUPPORTED)
            .setUserAgent("Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)")
            .build()
          webClient = new WebClient(browserVersion)
//          webClient.addRequestHeader("X-User-Agent", "Tinder Android Version 4.5.5,")
          webClient.addRequestHeader("User-Agent", "Tinder Android Version 4.5.5")
          webClient.getOptions.setJavaScriptEnabled(false)
          val page: HtmlPage = webClient.getPage("https://www.facebook.com/v2.6/dialog/oauth?redirect_uri=fb464891386855067%3A%2F%2Fauthorize%2F&display=touch&state=%7B%22challenge%22%3A%22IUUkEUqIGud332lfu%252BMJhxL4Wlc%253D%22%2C%220_auth_logger_id%22%3A%2230F06532-A1B9-4B10-BB28-B29956C71AB1%22%2C%22com.facebook.sdk_client_state%22%3Atrue%2C%223_method%22%3A%22sfvc_auth%22%7D&scope=user_birthday%2Cuser_photos%2Cuser_education_history%2Cemail%2Cuser_relationship_details%2Cuser_friends%2Cuser_work_history%2Cuser_likes&response_type=token%2Csigned_request&default_audience=friends&return_scopes=true&auth_type=rerequest&client_id=464891386855067&ret=login&sdk=ios&logger_id=30F06532-A1B9-4B10-BB28-B29956C71AB1&ext=1470840777&hash=AeZqkIcf-NEW6vBd")
          val form: HtmlForm = page.getHtmlElementById("login_form")
          val textUser: HtmlTextInput = form.getInputByName("email")
          val textPass: HtmlPasswordInput = form.getInputByName("pass")
          val submit: HtmlElement = form.getButtonByName("login")
          textUser.`type`(user)
          textPass.`type`(pass)

          val oauthPage: HtmlPage = submit.click()
          val confirm: HtmlSubmitInput = oauthPage.getElementByName("__CONFIRM__")
          val page2: HtmlPage = confirm.click()
          asdf = page2.asXml()
        } catch {
          case e => throw e
        } finally {
          webClient.close()
        }

        Ok(asdf)
        //        Redirect(routes.Application.index()).withSession("oauth" -> pass)
      }
    )
  }

  def updateLocation(lat: String, lon: String) = Action {
    implicit request =>
      AsyncResult {
        val token = session.get("tt").get
        new TinderRequest(token).post("user/ping", Map("lat" -> lat.toString, "lon" -> lon.toString), num = true).map {
          response => Ok(response.body).withSession(session)
        }
      }
  }

  def like(id: String) = Action { implicit request =>
    AsyncResult {
      val token = session.get("tt").get
      new TinderRequest(token).get("like/" + id).map {
        response => Ok(response.body).withSession(session)
      }
    }
  }

  def logOut() = Action {
    Redirect(routes.Application.enterCredentials()).withNewSession
  }

  def letsencrypt(id: String) = Action {
    if (id == "Z9nK6c_LWmrKjEnBWSXTdb3yJB6RaMpdUZtXsszCkrQ") {
      val v = s"$id.kQl1ygcqVdwIhJwicgT8h71Wd1lUMkIk3f3DxxEyEPs"
      Ok(v)
    } else {
      Redirect(routes.Application.index())
    }
  }

}
