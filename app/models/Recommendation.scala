package models

import models.Gender.Gender
import util.TinderRequest


/**
 * User: Mathew
 * Date: 23/4/2014
 * Time: 4:51 PM
 */
class Recommendation(id: String, name: String, bio: String, gender: Gender, birthDate: String) {
  def like() = {
    val response = new TinderRequest()
  }
}

object Recommendation {
  def fromMap(map: Map[String, String]) = {
    val id = map.getOrElse("_id", "")
    val name = map.getOrElse("name", "")
    val bio = map.getOrElse("bio", "")
    val gender = if (map.getOrElse("gender", 0) == 1) Gender.Female else Gender.Male
    val birthDate = map.getOrElse("birth_date", "")

    new Recommendation(id, name, bio, gender, birthDate)
  }
}